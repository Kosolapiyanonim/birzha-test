"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { Clock, DollarSign, Search, Star, Send, Eye } from "lucide-react"
import { ApplicationForm } from "@/components/application-form"
import { OrderDetailModal } from "@/components/order-detail-modal"
import { useViews } from "@/hooks/use-views"
import type { Database } from "@/lib/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  users: { username: string | null; rating: number; id: string } | null
}

interface OrdersListProps {
  showMyOrders?: boolean
  onOrderSelect?: (order: Order) => void
}

export function OrdersList({ showMyOrders = false, onOrderSelect }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [errorDetails, setErrorDetails] = useState<string>("")
  const { user } = useUser()
  const { trackOrderView } = useViews()
  const supabase = getSupabaseClient()

  const categories = [
    "Веб-разработка",
    "Мобильная разработка",
    "Дизайн",
    "Копирайтинг",
    "Маркетинг",
    "SEO",
    "Переводы",
    "Видеомонтаж",
    "Другое",
  ]

  useEffect(() => {
    fetchOrders()
  }, [user, showMyOrders])

  const fetchOrders = async () => {
    if (!user) return

    try {
      setErrorDetails("")

      // Сначала попробуем простой запрос без JOIN
      let query = supabase
        .from("orders")
        .select("*")
        .order("is_promoted", { ascending: false })
        .order("created_at", { ascending: false })

      if (showMyOrders) {
        query = query.eq("user_id", user.id)
        setDebugInfo(`Загружаем заказы пользователя: ${user.id}`)
      } else {
        query = query.neq("user_id", user.id)
        setDebugInfo(`Загружаем заказы для исполнителя, исключая пользователя: ${user.id}`)
      }

      const { data: ordersData, error: ordersError } = await query

      if (ordersError) {
        console.error("Orders query error:", ordersError)
        setErrorDetails(`Ошибка запроса заказов: ${JSON.stringify(ordersError)}`)
        throw ordersError
      }

      console.log("Orders data:", ordersData)

      // Теперь получаем информацию о пользователях отдельно
      if (ordersData && ordersData.length > 0) {
        const userIds = [...new Set(ordersData.map((order) => order.user_id))]

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, username, rating")
          .in("id", userIds)

        if (usersError) {
          console.error("Users query error:", usersError)
          setErrorDetails(`Ошибка запроса пользователей: ${JSON.stringify(usersError)}`)
        }

        // Объединяем данные
        const ordersWithUsers = ordersData.map((order) => ({
          ...order,
          users: usersData?.find((user) => user.id === order.user_id) || null,
        }))

        setOrders(ordersWithUsers)
        setDebugInfo(`Успешно загружено заказов: ${ordersWithUsers.length}`)
      } else {
        setOrders([])
        setDebugInfo("Заказы не найдены")
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      setErrorDetails(`Критическая ошибка: ${error.message || JSON.stringify(error)}`)
      setDebugInfo(`Критическая ошибка при загрузке заказов`)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || order.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Только что"
    if (diffInHours < 24) return `${diffInHours}ч назад`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}д назад`
  }

  const handleApplyClick = (order: Order) => {
    setSelectedOrder(order)
    setShowApplicationForm(true)
  }

  const handleOrderClick = async (order: Order) => {
    // Трекаем просмотр заказа
    await trackOrderView(order.id)

    setSelectedOrder(order)
    setShowOrderDetail(true)

    // Обновляем счетчик просмотров в локальном состоянии
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, views_count: (o.views_count || 0) + 1 } : o)))
  }

  const handleApplicationSuccess = () => {
    fetchOrders()
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
    <>
      <div className="space-y-6">
        {/* Debug Info */}
        <Card className="bg-blue-500/10 border border-blue-400/30">
          <CardContent className="p-3">
            <p className="text-blue-400 text-sm">
              <strong>Debug:</strong> {debugInfo}
            </p>
            <p className="text-blue-300 text-xs mt-1">
              User ID: {user?.id} | Role: {user?.role} | Show My Orders: {showMyOrders.toString()}
            </p>
            {errorDetails && (
              <p className="text-red-400 text-xs mt-2 break-all">
                <strong>Error:</strong> {errorDetails}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Поиск заказов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-white hover:bg-slate-700">
                Все категории
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">{showMyOrders ? "У вас пока нет заказов" : "Заказы не найдены"}</p>
                <p className="text-slate-500 text-xs mt-2">
                  Всего загружено: {orders.length} | После фильтров: {filteredOrders.length}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-200 cursor-pointer"
                onClick={() => handleOrderClick(order)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-white text-lg">{order.title}</CardTitle>
                        {order.is_promoted && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                            ТОП
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimeAgo(order.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {order.views_count || 0}
                        </div>
                        {!showMyOrders && order.users && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            {order.users.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-400 font-semibold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {order.budget.toLocaleString()} {order.currency}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{order.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {order.category}
                    </Badge>
                    <div className="flex space-x-2">
                      {!showMyOrders && user?.role === "executor" && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApplyClick(order)
                          }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Откликнуться
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetail(false)
            setSelectedOrder(null)
          }}
          onApply={() => {
            setShowOrderDetail(false)
            setShowApplicationForm(true)
          }}
        />
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedOrder && (
        <ApplicationForm
          order={selectedOrder}
          onClose={() => {
            setShowApplicationForm(false)
            setSelectedOrder(null)
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  )
}
