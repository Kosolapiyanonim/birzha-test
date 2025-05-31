"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { DollarSign, Star, FileText, CheckCircle, Eye, TrendingUp } from "lucide-react"

export function UserStats() {
  const [stats, setStats] = useState({
    balance: 0,
    totalOrders: 0,
    completedOrders: 0,
    activeApplications: 0,
    profileViews: 0,
    totalOrderViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      // Получаем статистику заказов
      const { data: orders } = await supabase.from("orders").select("status, views_count").eq("user_id", user.id)

      // Получаем статистику заявок
      const { data: applications } = await supabase.from("applications").select("status").eq("user_id", user.id)

      // Получаем просмотры профиля
      const { data: profileViewsData } = await supabase.from("profile_views").select("count").eq("profile_id", user.id)

      const totalOrders = orders?.length || 0
      const completedOrders = orders?.filter((o) => o.status === "completed").length || 0
      const activeApplications = applications?.filter((a) => a.status === "new").length || 0
      const profileViews = profileViewsData?.length || 0
      const totalOrderViews = orders?.reduce((sum, order) => sum + (order.views_count || 0), 0) || 0

      setStats({
        balance: 0, // Пока заглушка, потом добавим реальный баланс
        totalOrders,
        completedOrders,
        activeApplications,
        profileViews,
        totalOrderViews,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-slate-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-slate-400 text-sm">Баланс</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.balance} ₽</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-400 text-sm">Рейтинг</span>
          </div>
          <p className="text-xl font-bold text-white">{user?.rating.toFixed(1)}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-sm">{user?.role === "employer" ? "Заказов" : "Заявок"}</span>
          </div>
          <p className="text-xl font-bold text-white">
            {user?.role === "employer" ? stats.totalOrders : stats.activeApplications}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-400 text-sm">Выполнено</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.completedOrders}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400 text-sm">Просмотры профиля</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.profileViews}</p>
        </CardContent>
      </Card>

      {user?.role === "employer" && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-slate-400 text-sm">Просмотры заказов</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalOrderViews}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
