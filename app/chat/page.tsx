"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, ArrowLeft } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface Chat {
  partner_id: string
  partner_username: string
  last_message: string
  updated_at: string
}

export default function ChatListPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useUser()
  const router = useRouter()
  const supabase = getSupabaseClient()

  const myId = user?.tg_id?.toString() || ""

  // Загружаем чаты пользователя через Supabase RPC
  useEffect(() => {
    const fetchChats = async () => {
      if (!myId) return

      setLoading(true)
      try {
        const { data, error } = await supabase.rpc("get_my_chats", { user_id_input: myId })

        if (error) {
          console.error("Ошибка загрузки чатов:", error)
          setChats([])
        } else {
          setChats(data || [])
        }
      } catch (error) {
        console.error("Ошибка загрузки чатов:", error)
        setChats([])
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [myId, supabase])

  // Фильтрация чатов по поисковому запросу
  const filteredChats = chats.filter(
    (chat) =>
      chat.partner_username?.toLowerCase().includes(searchTerm.toLowerCase()) || chat.partner_id.includes(searchTerm),
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" })
    }
  }

  if (!myId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Ошибка авторизации</h2>
          <p className="text-slate-300 mb-4">Не удалось получить информацию о пользователе.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            На главную
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle size={24} />
              Мои чаты
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Поиск по имени или ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <MessageCircle className="mx-auto mb-4 animate-pulse" size={48} />
              Загрузка чатов...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageCircle className="mx-auto mb-4" size={48} />
              {searchTerm ? "Чаты не найдены" : "У вас пока нет активных чатов"}
              <p className="text-sm mt-2">
                {searchTerm
                  ? "Попробуйте изменить поисковый запрос"
                  : "Начните общение, нажав 'Написать' в любом разделе"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredChats.map((chat) => (
                <div
                  key={chat.partner_id}
                  onClick={() => router.push(`/chat/${chat.partner_id}?source=chat-list`)}
                  className="p-4 hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {chat.partner_username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate">
                          @{chat.partner_username || `user_${chat.partner_id.slice(0, 8)}`}
                        </h3>
                        <span className="text-xs text-slate-400">
                          {chat.updated_at ? formatTime(chat.updated_at) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 truncate mt-1">{chat.last_message || "Нет сообщений"}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {chat.partner_id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
