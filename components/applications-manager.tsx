"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "@/hooks/use-notifications"
import { FormattedText } from "@/components/formatted-text"
import { Clock, Star, MessageCircle, Check, X, Users, Send } from "lucide-react"
import type { Database } from "@/lib/supabase"

type Application = Database["public"]["Tables"]["applications"]["Row"] & {
  users: { username: string | null; rating: number; id: string; tg_id: number } | null
  orders: { title: string; budget: number; currency: string } | null
}

export function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { user } = useUser()
  const { sendNotification } = useNotifications()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    if (!user) return

    try {
      // Получаем заявки на заказы текущего пользователя
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          users (id, username, rating, tg_id),
          orders!inner (title, budget, currency, user_id)
        `)
        .eq("orders.user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: "accepted" | "declined") => {
    setProcessingId(applicationId)

    try {
      const { error } = await supabase.from("applications").update({ status: action }).eq("id", applicationId)

      if (error) throw error

      // Обновляем локальное состояние
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: action } : app)))

      // Отправляем уведомление исполнителю
      const application = applications.find((app) => app.id === applicationId)
      if (application?.users?.tg_id) {
        const message =
          action === "accepted"
            ? `✅ Ваша заявка на заказ "${application.orders?.title}" принята!`
            : `❌ Ваша заявка на заказ "${application.orders?.title}" отклонена`

        // Отправляем уведомление напрямую через Telegram ID
        await fetch("/api/bot/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: application.users.tg_id,
            message,
            type: action === "accepted" ? "success" : "info",
          }),
        })
      }

      // Если заявка принята, обновляем статус заказа
      if (action === "accepted" && application?.order_id) {
        await supabase.from("orders").update({ status: "in_progress" }).eq("id", application.order_id)
      }
    } catch (error) {
      console.error("Error updating application:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const openTelegramChat = (username: string | null) => {
    if (username) {
      const telegramUrl = `https://t.me/${username}`
      window.open(telegramUrl, "_blank")
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Только что"
    if (diffInHours < 24) return `${diffInHours}ч назад`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}д назад`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-600 text-white">Новая</Badge>
      case "accepted":
        return <Badge className="bg-green-600 text-white">Принята</Badge>
      case "declined":
        return <Badge className="bg-red-600 text-white">Отклонена</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const filterApplications = (status: string) => {
    if (status === "all") return applications
    return applications.filter((app) => app.status === status)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Все ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Новые ({filterApplications("new").length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Принятые ({filterApplications("accepted").length})
          </TabsTrigger>
          <TabsTrigger value="declined" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Отклоненные ({filterApplications("declined").length})
          </TabsTrigger>
        </TabsList>

        {["all", "new", "accepted", "declined"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-6">
            {filterApplications(status).length === 0 ? (
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">
                    {status === "new" ? "Нет новых заявок" : `Нет заявок со статусом "${status}"`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterApplications(status).map((application) => (
                <Card key={application.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-white text-lg">{application.orders?.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTimeAgo(application.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />@{application.users?.username || "Пользователь"}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            {application.users?.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(application.status)}
                        <div className="text-green-400 font-semibold text-sm">
                          {application.orders?.budget.toLocaleString()} {application.orders?.currency}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Комментарий исполнителя */}
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300 text-sm font-medium">Сообщение от исполнителя:</span>
                      </div>
                      <FormattedText text={application.comment} className="text-slate-300 leading-relaxed" />
                    </div>

                    {/* Действия */}
                    <div className="flex space-x-3">
                      {application.status === "new" && (
                        <>
                          <Button
                            onClick={() => handleApplicationAction(application.id, "accepted")}
                            disabled={processingId === application.id}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Принять заявку
                          </Button>
                          <Button
                            onClick={() => handleApplicationAction(application.id, "declined")}
                            disabled={processingId === application.id}
                            variant="outline"
                            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Отклонить
                          </Button>
                        </>
                      )}

                      {/* Кнопка написать в Telegram */}
                      {application.users?.username && (
                        <Button
                          onClick={() => openTelegramChat(application.users?.username)}
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 rounded-xl"
                        >
                          <Send className="w-4 h-4 mr-2" />@{application.users.username}
                        </Button>
                      )}
                    </div>

                    {application.status === "accepted" && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 text-sm text-center">
                          ✅ Заявка принята. Заказ переведен в работу.
                        </p>
                      </div>
                    )}

                    {application.status === "declined" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm text-center">❌ Заявка отклонена.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
