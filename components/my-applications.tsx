"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { FormattedText } from "@/components/formatted-text"
import { Clock, DollarSign, MessageCircle, Star, Eye } from "lucide-react"
import type { Database } from "@/lib/supabase"

type Application = Database["public"]["Tables"]["applications"]["Row"] & {
  orders: {
    title: string
    budget: number
    currency: string
    status: string
    users: { username: string | null; rating: number } | null
  } | null
}

export function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          orders (
            title,
            budget,
            currency,
            status,
            users (username, rating)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
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
        return <Badge className="bg-blue-600 text-white">На рассмотрении</Badge>
      case "accepted":
        return <Badge className="bg-green-600 text-white">Принята</Badge>
      case "declined":
        return <Badge className="bg-red-600 text-white">Отклонена</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            Активен
          </Badge>
        )
      case "in_progress":
        return <Badge className="bg-orange-600 text-white">В работе</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white">Завершен</Badge>
      case "cancelled":
        return <Badge className="bg-gray-600 text-white">Отменен</Badge>
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
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Все ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            На рассмотрении ({filterApplications("new").length})
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
                    {status === "all" ? "У вас пока нет заявок" : `Нет заявок со статусом "${status}"`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterApplications(status).map((application) => (
                <Card key={application.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-white text-lg">{application.orders?.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTimeAgo(application.created_at)}
                          </div>
                          {application.orders?.users && (
                            <>
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />@{application.orders.users.username || "Пользователь"}
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                {application.orders.users.rating.toFixed(1)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex space-x-2">
                          {getStatusBadge(application.status)}
                          {application.orders?.status && getOrderStatusBadge(application.orders.status)}
                        </div>
                        <div className="flex items-center text-green-400 font-semibold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {application.orders?.budget.toLocaleString()} {application.orders?.currency}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Ваш комментарий */}
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300 text-sm font-medium">Ваше сообщение:</span>
                      </div>
                      <FormattedText text={application.comment} className="text-slate-300 leading-relaxed" />
                    </div>

                    {/* Статус информация */}
                    {application.status === "new" && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-sm text-center">
                          ⏳ Заявка отправлена и ожидает рассмотрения заказчиком
                        </p>
                      </div>
                    )}

                    {application.status === "accepted" && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 text-sm text-center">
                          ✅ Поздравляем! Ваша заявка принята. Можете приступать к работе.
                        </p>
                      </div>
                    )}

                    {application.status === "declined" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm text-center">
                          ❌ К сожалению, ваша заявка была отклонена заказчиком
                        </p>
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
