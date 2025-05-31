"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "@/hooks/use-notifications"
import { Send, AlertCircle, CheckCircle } from "lucide-react"

interface SupportTicketFormProps {
  orderId?: string
  onTicketCreated?: () => void
}

export function SupportTicketForm({ orderId, onTicketCreated }: SupportTicketFormProps) {
  const [message, setMessage] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || "none")
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useUser()
  const { sendNotification } = useNotifications()
  const supabase = getSupabaseClient()

  // Загружаем заказы пользователя при открытии формы
  React.useEffect(() => {
    if (user && !orderId) {
      fetchUserOrders()
    }
  }, [user, orderId])

  const fetchUserOrders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, title, order_number, status")
        .or(`user_id.eq.${user.id},executor_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (error) throw error
      setUserOrders(data || [])
    } catch (error) {
      console.error("Error fetching user orders:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !message.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        order_id: selectedOrderId && selectedOrderId !== "none" ? selectedOrderId : null,
        message: message.trim(),
      })

      if (error) throw error

      setSuccess(true)
      setMessage("")
      setSelectedOrderId("none")

      // Отправляем уведомление админам
      await sendNotification(`🎫 Новое обращение в поддержку от @${user.username || "пользователя"}`, "info")

      setTimeout(() => {
        setSuccess(false)
        onTicketCreated?.()
      }, 2000)
    } catch (error: any) {
      console.error("Error creating support ticket:", error)
      setError(error.message || "Ошибка при отправке обращения")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Обращение отправлено!</h3>
          <p className="text-slate-300">Мы рассмотрим ваше обращение в ближайшее время</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Обратиться в поддержку</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Выбор заказа (если не передан orderId) */}
          {!orderId && userOrders.length > 0 && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Связанный заказ (необязательно)</label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Выберите заказ или оставьте пустым" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="none" className="text-white hover:bg-slate-700">
                    Общий вопрос (без привязки к заказу)
                  </SelectItem>
                  {userOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id} className="text-white hover:bg-slate-700">
                      {order.order_number} - {order.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Сообщение */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Опишите вашу проблему или вопрос</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Подробно опишите вашу ситуацию, проблему или вопрос. Чем больше деталей вы предоставите, тем быстрее мы сможем вам помочь."
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[120px] resize-none"
              required
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-slate-400">Минимум 20 символов ({message.length}/1000)</p>
              {message.length > 1000 && <p className="text-xs text-red-400">Превышен лимит символов</p>}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || message.trim().length < 20 || message.length > 1000}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Отправка...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Отправить обращение</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
