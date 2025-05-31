"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "./use-notifications"
import type { Database } from "@/lib/supabase"

type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  sender: { username: string | null; id: string } | null
}

type Chat = Database["public"]["Tables"]["chats"]["Row"] & {
  orders: { title: string } | null
  employer: { username: string | null; id: string } | null
  executor: { username: string | null; id: string } | null
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const { user } = useUser()
  const { sendNotification } = useNotifications()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user])

  const fetchChats = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("chats")
        .select(`
          *,
          orders (title),
          employer:employer_id (id, username),
          executor:executor_id (id, username)
        `)
        .or(`employer_id.eq.${user.id},executor_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })

      if (error) throw error
      setChats(data || [])
    } catch (error) {
      console.error("Error fetching chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (orderId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id (id, username)
        `)
        .eq("order_id", orderId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Отмечаем сообщения как прочитанные
      await markMessagesAsRead(orderId)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async (orderId: string, content: string, receiverId: string) => {
    if (!user || !content.trim()) return

    setSendingMessage(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          order_id: orderId,
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
        })
        .select(`
          *,
          sender:sender_id (id, username)
        `)
        .single()

      if (error) throw error

      // Добавляем сообщение в локальное состояние
      setMessages((prev) => [...prev, data])

      // Отправляем уведомление получателю
      const chat = chats.find((c) => c.order_id === orderId)
      const orderTitle = chat?.orders?.title || "заказ"
      await sendNotification(`💬 Новое сообщение по заказу "${orderTitle}"`, "info")

      return data
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    } finally {
      setSendingMessage(false)
    }
  }

  const markMessagesAsRead = async (orderId: string) => {
    if (!user) return

    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("order_id", orderId)
        .eq("receiver_id", user.id)
        .eq("is_read", false)
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const getUnreadCount = (chatId: string) => {
    return messages.filter((msg) => msg.receiver_id === user?.id && !msg.is_read).length
  }

  return {
    chats,
    messages,
    loading,
    sendingMessage,
    fetchChats,
    fetchMessages,
    sendMessage,
    getUnreadCount,
  }
}
