"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import { useUserChats, type UserChat } from "@/hooks/use-user-chats"
import UserChatComponent from "./user-chat"

export function ChatsList() {
  const [selectedChat, setSelectedChat] = useState<UserChat | null>(null)
  const { chats, loading } = useUserChats()

  if (selectedChat) {
    return <UserChatComponent selectedChat={selectedChat} onBack={() => setSelectedChat(null)} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Сообщения
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Загрузка чатов...</p>
        ) : chats.length === 0 ? (
          <p className="text-gray-500 text-center py-8">У вас пока нет активных чатов</p>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Avatar>
                  <AvatarFallback>
                    {chat.other_user?.first_name?.[0] || chat.other_user?.username?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{chat.other_user?.first_name || chat.other_user?.username}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(chat.last_message_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  {chat.other_user?.username && (
                    <p className="text-sm text-gray-500 truncate">@{chat.other_user.username}</p>
                  )}
                  {chat.unread_count && chat.unread_count > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {chat.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
