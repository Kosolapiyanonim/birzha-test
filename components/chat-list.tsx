"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useChat } from "@/hooks/use-chat"
import { useUser } from "@/contexts/user-context"
import { MessageCircle, Clock, Users } from "lucide-react"

interface ChatListProps {
  onChatSelect: (orderId: string, receiverId: string, orderTitle: string) => void
}

export function ChatList({ onChatSelect }: ChatListProps) {
  const { chats, loading } = useChat()
  const { user } = useUser()

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Только что"
    if (diffInHours < 24) return `${diffInHours}ч назад`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}д назад`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">У вас пока нет активных чатов</p>
          <p className="text-slate-500 text-sm mt-2">Чаты создаются автоматически при принятии заявки на заказ</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {chats.map((chat) => {
        const isEmployer = user?.id === chat.employer_id
        const otherUser = isEmployer ? chat.executor : chat.employer
        const receiverId = isEmployer ? chat.executor_id : chat.employer_id

        return (
          <Card
            key={chat.id}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-200 cursor-pointer"
            onClick={() => onChatSelect(chat.order_id, receiverId, chat.orders?.title || "Заказ")}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-white text-lg">{chat.orders?.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />@{otherUser?.username || "Пользователь"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeAgo(chat.last_message_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {isEmployer ? "Заказчик" : "Исполнитель"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
