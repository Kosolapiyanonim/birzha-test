"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, AlertCircle, CheckCircle, Link } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "@/hooks/use-notifications"
import type { Database } from "@/lib/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"]

interface ApplicationFormProps {
  order: Order
  onClose: () => void
  onSuccess: () => void
}

export function ApplicationForm({ order, onClose, onSuccess }: ApplicationFormProps) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { user } = useUser()
  const { sendNotification } = useNotifications()
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !comment.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Проверяем, не подавал ли пользователь уже заявку
      const { data: existingApplication } = await supabase
        .from("applications")
        .select("id")
        .eq("order_id", order.id)
        .eq("user_id", user.id)
        .single()

      if (existingApplication) {
        setError("Вы уже подали заявку на этот заказ")
        return
      }

      // Создаем заявку
      const { error: insertError } = await supabase.from("applications").insert({
        order_id: order.id,
        user_id: user.id,
        comment: comment.trim(),
      })

      if (insertError) throw insertError

      setSuccess(true)

      // Отправляем уведомление
      await sendNotification(`🎯 Новая заявка на заказ "${order.title}" от @${user.username || "пользователя"}`, "info")

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (error: any) {
      console.error("Error submitting application:", error)
      setError(error.message || "Ошибка при отправке заявки")
    } finally {
      setLoading(false)
    }
  }

  const insertLinkTemplate = () => {
    const linkTemplate = "[Название ссылки](https://example.com)"
    const textarea = document.querySelector('textarea[name="comment"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = comment.substring(0, start) + linkTemplate + comment.substring(end)
      setComment(newValue)

      // Устанавливаем курсор на "Название ссылки"
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 1, start + 15)
      }, 0)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Заявка отправлена!</h3>
            <p className="text-slate-300">Заказчик получит уведомление о вашей заявке</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-white">Подать заявку</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {/* Order info */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h4 className="text-white font-semibold mb-2">{order.title}</h4>
            <p className="text-slate-300 text-sm mb-2">{order.description.slice(0, 100)}...</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{order.category}</span>
              <span className="text-green-400 font-semibold">
                {order.budget.toLocaleString()} {order.currency}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white text-sm font-medium">Сообщение заказчику</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={insertLinkTemplate}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto"
                >
                  <Link className="w-3 h-3 mr-1" />
                  Добавить ссылку
                </Button>
              </div>
              <Textarea
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о своем опыте, предложите решение, укажите сроки выполнения...

Вы можете добавить ссылки на портфолио в формате:
[Название ссылки](https://example.com)

Например:
[Мое портфолио](https://myportfolio.com)
[Примеры работ](https://github.com/username)"
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 min-h-[150px] resize-none"
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-slate-400">Минимум 20 символов, максимум 500 ({comment.length}/500)</p>
                {comment.length > 500 && <p className="text-xs text-red-400">Превышен лимит символов</p>}
              </div>
            </div>

            {/* Подсказка по ссылкам */}
            <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <Link className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 text-sm font-medium">Как добавить ссылку:</p>
                  <p className="text-blue-300 text-xs mt-1">Используйте формат: [Текст ссылки](https://ссылка.com)</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <Button
                type="submit"
                disabled={loading || comment.trim().length < 20 || comment.length > 500}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Отправка...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Отправить заявку</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/20 text-white hover:bg-white/10 rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
