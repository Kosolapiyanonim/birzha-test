"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "@/hooks/use-notifications"
import { CheckCircle, AlertTriangle, Star } from "lucide-react"
import type { Database } from "@/lib/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  executor: { username: string | null; rating: number } | null
  employer: { username: string | null; rating: number } | null
}

interface OrderStatusManagerProps {
  order: Order
  onStatusUpdate: () => void
}

export function OrderStatusManager({ order, onStatusUpdate }: OrderStatusManagerProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const { sendNotification } = useNotifications()
  const supabase = getSupabaseClient()

  const isEmployer = user?.id === order.user_id
  const isExecutor = user?.id === order.executor_id

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id)

      if (error) throw error

      // Отправляем уведомления
      if (newStatus === "completed" && isExecutor) {
        await sendNotification(
          `✅ Заказ "${order.title}" (${order.order_number}) отмечен как выполненный исполнителем`,
          "success",
        )
      } else if (newStatus === "dispute") {
        await sendNotification(`⚠️ По заказу "${order.title}" (${order.order_number}) открыт спор`, "warning")
      }

      onStatusUpdate()
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmCompletion = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from("orders").update({ confirmed_by_customer: true }).eq("id", order.id)

      if (error) throw error

      await sendNotification(
        `🎉 Заказ "${order.title}" (${order.order_number}) успешно завершен и подтвержден заказчиком!`,
        "success",
      )
      onStatusUpdate()
    } catch (error) {
      console.error("Error confirming completion:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-600 text-white">Новый</Badge>
      case "in_progress":
        return <Badge className="bg-orange-600 text-white">В работе</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white">Выполнен</Badge>
      case "cancelled":
        return <Badge className="bg-gray-600 text-white">Отменен</Badge>
      case "dispute":
        return <Badge className="bg-red-600 text-white">Спор</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Управление заказом</CardTitle>
          {getStatusBadge(order.status)}
        </div>
        <div className="text-sm text-slate-400">Номер заказа: {order.order_number}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Информация о участниках */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-slate-300 text-sm font-medium">Заказчик:</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white">@{order.employer?.username || "Пользователь"}</span>
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-sm">{order.employer?.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {order.executor && (
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-slate-300 text-sm font-medium">Исполнитель:</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white">@{order.executor.username || "Пользователь"}</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-sm">{order.executor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Действия в зависимости от статуса и роли */}
        <div className="space-y-3">
          {/* Исполнитель может отметить заказ как выполненный */}
          {isExecutor && order.status === "in_progress" && (
            <Button
              onClick={() => handleStatusUpdate("completed")}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Отметить как выполненный
            </Button>
          )}

          {/* Заказчик может подтвердить выполнение */}
          {isEmployer && order.status === "completed" && !order.confirmed_by_customer && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                <p className="text-blue-400 text-sm text-center">
                  ✅ Исполнитель отметил заказ как выполненный. Проверьте результат и подтвердите завершение.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleConfirmCompletion}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Подтвердить выполнение
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("dispute")}
                  disabled={loading}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Открыть спор
                </Button>
              </div>
            </div>
          )}

          {/* Статус информация */}
          {order.status === "completed" && order.confirmed_by_customer && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm text-center">🎉 Заказ успешно завершен и подтвержден заказчиком!</p>
            </div>
          )}

          {order.status === "dispute" && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">
                ⚠️ По заказу открыт спор. Обратитесь в службу поддержки для решения.
              </p>
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
              <p className="text-gray-400 text-sm text-center">❌ Заказ был отменен.</p>
            </div>
          )}

          {/* Любой участник может открыть спор */}
          {(isEmployer || isExecutor) && order.status === "in_progress" && (
            <Button
              onClick={() => handleStatusUpdate("dispute")}
              disabled={loading}
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Открыть спор
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
