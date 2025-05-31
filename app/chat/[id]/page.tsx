"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, ArrowLeft, Info, AlertCircle } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  from_id: string
  to_id: string
  content: string
  created_at: string
}

// Список проблемных ID, для которых не нужно отправлять уведомления
const PROBLEMATIC_IDS = ["2c63b8fb-48a5-409f-b51b-e32037ce93b1"]

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [partnerInfo, setPartnerInfo] = useState<any>(null)
  const [notificationsDisabled, setNotificationsDisabled] = useState(false)
  const { user } = useUser()
  const supabase = getSupabaseClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Используем Telegram ID для сообщений, если доступен
  const myId = user?.tg_id?.toString() || user?.id || ""
  const toId = params.id?.toString() || ""
  const source = searchParams.get("source")

  // Проверяем, является ли ID проблемным
  useEffect(() => {
    if (PROBLEMATIC_IDS.includes(toId)) {
      setNotificationsDisabled(true)
      console.log("Уведомления отключены для этого ID:", toId)
    }
  }, [toId])

  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Загружаем информацию о собеседнике
  useEffect(() => {
    const fetchPartnerInfo = async () => {
      if (!toId) return

      try {
        let data = null

        // Сначала пробуем найти по Telegram ID
        const telegramId = Number.parseInt(toId)
        if (!isNaN(telegramId)) {
          const result = await supabase
            .from("users")
            .select("username, rating, tg_id, id")
            .eq("tg_id", telegramId)
            .single()
          data = result.data
          console.log("Found user by Telegram ID:", data)
        }

        // Если не найден по Telegram ID, пробуем найти по UUID
        if (!data) {
          const result = await supabase.from("users").select("username, rating, tg_id, id").eq("id", toId).single()
          data = result.data
          console.log("Found user by UUID:", data)
        }

        if (data) {
          setPartnerInfo(data)
          // Если у пользователя нет Telegram ID, отключаем уведомления
          if (!data.tg_id) {
            setNotificationsDisabled(true)
            console.log("Уведомления отключены: у пользователя нет Telegram ID")
          }
        } else {
          setPartnerInfo({ username: `user_${toId.slice(0, 8)}`, rating: null })
          setNotificationsDisabled(true)
          console.log("Уведомления отключены: пользователь не найден")
        }
      } catch (error) {
        console.error("Ошибка загрузки информации о пользователе:", error)
        setPartnerInfo({ username: `user_${toId.slice(0, 8)}`, rating: null })
        setNotificationsDisabled(true)
      }
    }

    fetchPartnerInfo()
  }, [toId, supabase])

  useEffect(() => {
    if (!myId || !toId) return

    // 1. Загрузка истории
    const loadMessages = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from("messages")
          .select("*")
          .or(`and(from_id.eq.${myId},to_id.eq.${toId}),and(from_id.eq.${toId},to_id.eq.${myId})`)
          .order("created_at")
        setMessages(data || [])
      } catch (error) {
        console.error("Ошибка загрузки сообщений:", error)
      } finally {
        setLoading(false)
        setTimeout(scrollToBottom, 100)
      }
    }
    loadMessages()

    // 2. Подписка на новые сообщения
    const sub = supabase
      .channel("chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message
        if ((msg.from_id === myId && msg.to_id === toId) || (msg.from_id === toId && msg.to_id === myId)) {
          setMessages((prev) => [...prev, msg])
          setTimeout(scrollToBottom, 100)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [myId, toId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !myId || !toId || sending) return

    setSending(true)
    try {
      // Отправляем сообщение
      const { error } = await supabase.from("messages").insert({
        from_id: myId,
        to_id: toId,
        content: newMessage.trim(),
      })

      if (error) {
        console.error("Ошибка отправки сообщения:", error)
        toast({
          title: "Ошибка отправки",
          description: "Не удалось отправить сообщение. Попробуйте еще раз.",
          variant: "destructive",
        })
        return
      }

      const messageToSend = newMessage.trim()
      setNewMessage("")

      // Пытаемся отправить уведомление в Telegram, только если уведомления не отключены
      if (!notificationsDisabled) {
        try {
          console.log("Отправка уведомления в Telegram для:", toId)
          const response = await fetch("/api/bot/notify-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toId: partnerInfo?.tg_id || toId, // Используем tg_id, если доступен
              fromId: myId,
              message: messageToSend,
              source: source || "chat",
            }),
          })

          const result = await response.json()
          if (!result.success) {
            console.warn("Уведомление в Telegram не отправлено:", result.error)
            // Отключаем уведомления для этого чата после первой ошибки
            setNotificationsDisabled(true)
          } else {
            console.log("Уведомление в Telegram отправлено успешно")
          }
        } catch (notificationError) {
          console.warn("Ошибка отправки уведомления в Telegram:", notificationError)
          // Отключаем уведомления для этого чата после первой ошибки
          setNotificationsDisabled(true)
        }
      } else {
        console.log("Уведомления отключены для этого чата")
      }
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error)
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение. Попробуйте еще раз.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  if (!myId || !toId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Ошибка доступа</h2>
          <p className="text-slate-300 mb-4">Не удалось загрузить информацию о пользователях.</p>
          <Button onClick={() => router.push("/chat")} className="bg-blue-600 hover:bg-blue-700">
            Вернуться к списку чатов
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/chat")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {partnerInfo?.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">@{partnerInfo?.username || "Пользователь"}</h1>
                <p className="text-sm text-slate-400">
                  {partnerInfo?.tg_id ? `Telegram ID: ${partnerInfo.tg_id}` : `ID: ${toId.slice(0, 8)}...`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notificationsDisabled && (
              <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                <AlertCircle size={14} />
                Только веб
              </div>
            )}
            {source && (
              <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                <Info size={14} />
                {source}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-slate-400 text-center py-4">Загрузка сообщений...</div>
          ) : messages.length === 0 ? (
            <div className="text-slate-400 text-center py-4">
              Нет сообщений. Начните общение!
              {source && <div className="text-xs mt-2">Контекст: {source}</div>}
              {notificationsDisabled && (
                <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 p-2 rounded">
                  Уведомления в Telegram отключены для этого чата. Сообщения доступны только в веб-приложении.
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from_id === myId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[70%] ${
                      m.from_id === myId ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"
                    }`}
                  >
                    <div>{m.content}</div>
                    <div className={`text-xs mt-1 ${m.from_id === myId ? "text-blue-200" : "text-slate-400"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              disabled={sending}
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={sending || !newMessage.trim()}>
              {sending ? "..." : <Send size={18} />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
