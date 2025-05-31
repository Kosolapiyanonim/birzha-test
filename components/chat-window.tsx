"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "@/hooks/use-chat"
import { useUser } from "@/contexts/user-context"
import { ArrowLeft, Send, MessageCircle } from "lucide-react"

interface ChatWindowProps {
  orderId: string
  receiverId: string
  orderTitle: string
  onBack: () => void
}

export function ChatWindow({ orderId, receiverId, orderTitle, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const { messages, sendingMessage, fetchMessages, sendMessage } = useChat()
  const { user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages(orderId)
  }, [orderId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    try {
      await sendMessage(orderId, newMessage, receiverId)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера"
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      })
    }
  }

  // Группируем сообщения по дням
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    },
    {} as Record<string, typeof messages>,
  )

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b border-slate-700">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-slate-700 mr-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <CardTitle className="text-white text-lg">{orderTitle}</CardTitle>
          <p className="text-slate-400 text-sm">Чат с исполнителем</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Начните общение</p>
              <p className="text-slate-500 text-sm">Отправьте первое сообщение</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="text-center my-4">
                  <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs">{formatDate(date)}</span>
                </div>

                {/* Messages for this day */}
                {dayMessages.map((message) => {
                  const isOwn = message.sender_id === user?.id
                  return (
                    <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-slate-700 text-slate-100"
                        }`}
                      >
                        <p className="leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-slate-400"} text-right`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t border-slate-700 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              className="flex-1 bg-slate-900/50 border-slate-600 text-white"
              disabled={sendingMessage}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sendingMessage}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {sendingMessage ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
