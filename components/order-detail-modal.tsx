"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Send, Clock, DollarSign, Star, Eye, Users } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useViews } from "@/hooks/use-views"
import type { Database } from "@/lib/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  users: { username: string | null; rating: number; id: string } | null
}

interface OrderDetailModalProps {
  order: Order
  onClose: () => void
  onApply: () => void
}

export function OrderDetailModal({ order, onClose, onApply }: OrderDetailModalProps) {
  const [profileViews, setProfileViews] = useState(0)
  const { user } = useUser()
  const { trackProfileView, getProfileViews } = useViews()

  useEffect(() => {
    if (order.users?.id) {
      // Трекаем просмотр профиля автора заказа
      trackProfileView(order.users.id)

      // Получаем количество просмотров профиля
      getProfileViews(order.users.id).then(setProfileViews)
    }
  }, [order.users?.id])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Только что"
    if (diffInHours < 24) return `${diffInHours}ч назад`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}д назад`
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/10">
          <CardTitle className="text-white text-xl">{order.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {order.is_promoted && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">ТОП</Badge>
                )}
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {order.category}
                </Badge>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-400 font-bold text-xl">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {order.budget.toLocaleString()} {order.currency}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTimeAgo(order.created_at)}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {order.views_count || 0} просмотров
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Описание задачи</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{order.description}</p>
            </div>
          </div>

          {/* Author Info */}
          {order.users && (
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Заказчик</h3>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">@{order.users.username || "Пользователь"}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {order.users.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {profileViews} просмотров профиля
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {user?.role === "executor" && user.id !== order.user_id && (
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={onApply}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <Send className="w-4 h-4 mr-2" />
                Откликнуться на заказ
              </Button>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-xs text-slate-400 text-center pt-4 border-t border-white/10">
            ID заказа: {order.id.slice(0, 8)}...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
