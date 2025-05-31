"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "@/hooks/use-notifications"
import { Users, FileText, MessageCircle, TrendingUp, CheckCircle, Clock, AlertTriangle, Shield } from "lucide-react"
import type { Database } from "@/lib/supabase"

type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"] & {
  users: { username: string | null; tg_id: number } | null
  orders: { title: string; order_number: string } | null
}

export function AdminPanel() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    openTickets: 0,
    resolvedTickets: 0,
  })
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [processingTicket, setProcessingTicket] = useState<string | null>(null)

  const { user } = useUser()
  const { sendNotification } = useNotifications()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      // Получаем статистику
      const [usersData, ordersData, ticketsData] = await Promise.all([
        supabase.from("users").select("count"),
        supabase.from("orders").select("status"),
        supabase.from("support_tickets").select("is_resolved"),
      ])

      const totalUsers = usersData.data?.length || 0
      const totalOrders = ordersData.data?.length || 0
      const activeOrders = ordersData.data?.filter((o) => o.status === "in_progress").length || 0
      const completedOrders = ordersData.data?.filter((o) => o.status === "completed").length || 0
      const openTickets = ticketsData.data?.filter((t) => !t.is_resolved).length || 0
      const resolvedTickets = ticketsData.data?.filter((t) => t.is_resolved).length || 0

      setStats({
        totalUsers,
        totalOrders,
        activeOrders,
        completedOrders,
        openTickets,
        resolvedTickets,
      })

      // Получаем тикеты поддержки
      const { data: ticketsWithDetails } = await supabase
        .from("support_tickets")
        .select(`
          *,
          users (username, tg_id),
          orders (title, order_number)
        `)
        .order("created_at", { ascending: false })

      setTickets(ticketsWithDetails || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveTicket = async (ticketId: string, userId: number) => {
    setProcessingTicket(ticketId)
    try {
      const { error } = await supabase.from("support_tickets").update({ is_resolved: true }).eq("id", ticketId)

      if (error) throw error

      // Отправляем уведомление пользователю
      await fetch("/api/bot/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          message: "✅ Ваше обращение в поддержку было рассмотрено и решено",
          type: "success",
        }),
      })

      // Обновляем локальное состояние
      setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, is_resolved: true } : ticket)))

      // Обновляем статистику
      setStats((prev) => ({
        ...prev,
        openTickets: prev.openTickets - 1,
        resolvedTickets: prev.resolvedTickets + 1,
      }))
    } catch (error) {
      console.error("Error resolving ticket:", error)
    } finally {
      setProcessingTicket(null)
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

  // Проверяем права администратора
  if (!user?.is_admin) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-8 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">У вас нет прав доступа к админ-панели</p>
        </CardContent>
      </Card>
    )
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
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-sm">Пользователи</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-sm">Всего заказов</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-slate-400 text-sm">В работе</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.activeOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-sm">Завершено</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.completedOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-slate-400 text-sm">Открытые тикеты</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.openTickets}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400 text-sm">Решено тикетов</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.resolvedTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Тикеты поддержки */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="open" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Открытые ({tickets.filter((t) => !t.is_resolved).length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Решенные ({tickets.filter((t) => t.is_resolved).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4 mt-6">
          {tickets.filter((t) => !t.is_resolved).length === 0 ? (
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Нет открытых обращений</p>
              </CardContent>
            </Card>
          ) : (
            tickets
              .filter((t) => !t.is_resolved)
              .map((ticket) => (
                <Card key={ticket.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTimeAgo(ticket.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />@{ticket.users?.username || "Пользователь"}
                          </div>
                          {ticket.orders && (
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {ticket.orders.order_number}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-red-600 text-white">Открыт</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {ticket.orders && (
                      <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          <strong>Связанный заказ:</strong> {ticket.orders.title}
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    <Button
                      onClick={() => handleResolveTicket(ticket.id, ticket.users?.tg_id || 0)}
                      disabled={processingTicket === ticket.id}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl"
                    >
                      {processingTicket === ticket.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Обработка...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Отметить как решенное</span>
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          {tickets.filter((t) => t.is_resolved).length === 0 ? (
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Нет решенных обращений</p>
              </CardContent>
            </Card>
          ) : (
            tickets
              .filter((t) => t.is_resolved)
              .map((ticket) => (
                <Card key={ticket.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTimeAgo(ticket.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />@{ticket.users?.username || "Пользователь"}
                          </div>
                          {ticket.orders && (
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {ticket.orders.order_number}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">Решен</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
