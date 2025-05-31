"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, ArrowLeft } from "lucide-react"
import { useUserChats, type UserChat as UserChatType } from "@/hooks/use-user-chats"
import { useUser } from "@/contexts/user-context"

interface UserChatProps {
  selectedChat: UserChatType | null
  onBack: () => void
}

export default function UserChat({ selectedChat, onBack }: UserChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const { messages, sendMessage, fetchMessages, markAsRead } = useUserChats()
  const { user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
      markAsRead(selectedChat.id)
    }
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    await sendMessage(selectedChat.id, newMessage.trim())
    setNewMessage("")
  }

  if (!selectedChat) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">Выберите чат для начала общения</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center space-y-0 pb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar className="w-8 h-8 mr-3">
          <AvatarFallback>
            {selectedChat.other_user?.first_name?.[0] || selectedChat.other_user?.username?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">
            {selectedChat.other_user?.first_name || selectedChat.other_user?.username}
          </CardTitle>
          {selectedChat.other_user?.username && (
            <p className="text-sm text-gray-500">@{selectedChat.other_user.username}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    message.sender_id === user?.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(message.created_at).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
