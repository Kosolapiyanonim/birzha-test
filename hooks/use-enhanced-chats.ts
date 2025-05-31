"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"

export interface EnhancedChat {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  created_at: string
  chat_type: "direct" | "order" | "service" | "ad" | "partnership"
  related_id: string | null
  title: string | null
  other_user?: {
    id: string
    username: string | null
    tg_id: number
  }
  last_message?: {
    content: string
    sender_id: string
    created_at: string
  }
  unread_count?: number
}

export interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  message_type: "text" | "image" | "file"
  file_url?: string | null
  created_at: string
  telegram_message_id?: number | null
  source: "webapp" | "telegram"
  sender?: {
    username: string | null
    tg_id: number
  }
}

export function useEnhancedChats() {
  const [chats, setChats] = useState<EnhancedChat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const fetchChats = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("user_chats")
        .select(`
          *,
          participant1:users!user_chats_participant1_id_fkey(id, username, tg_id),
          participant2:users!user_chats_participant2_id_fkey(id, username, tg_id),
          last_message:chat_messages(content, sender_id, created_at)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })

      if (error) throw error

      const chatsWithOtherUser =
        data?.map((chat) => ({
          ...chat,
          other_user: chat.participant1_id === user.id ? chat.participant2 : chat.participant1,
          last_message: chat.last_message?.[0] || null,
        })) || []

      setChats(chatsWithOtherUser)
    } catch (error) {
      console.error("Error fetching chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          sender:users(username, tg_id)
        `)
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const createOrGetChat = async (
    otherUserId: string,
    chatType: "direct" | "order" | "service" | "ad" | "partnership" = "direct",
    relatedId?: string,
    title?: string,
  ) => {
    if (!user?.id) return null

    try {
      // Проверяем, существует ли уже чат для этого типа и связанного объекта
      let query = supabase.from("user_chats").select("*").eq("chat_type", chatType)

      if (relatedId) {
        query = query.eq("related_id", relatedId)
      }

      query = query.or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`,
      )

      const { data: existingChat } = await query.single()

      if (existingChat) {
        return existingChat.id
      }

      // Создаем новый чат
      const { data: newChat, error } = await supabase
        .from("user_chats")
        .insert({
          participant1_id: user.id,
          participant2_id: otherUserId,
          chat_type: chatType,
          related_id: relatedId || null,
          title: title || null,
        })
        .select()
        .single()

      if (error) throw error
      return newChat.id
    } catch (error) {
      console.error("Error creating chat:", error)
      return null
    }
  }

  const sendMessage = async (chatId: string, content: string, source: "webapp" | "telegram" = "webapp") => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from("chat_messages").insert({
        chat_id: chatId,
        sender_id: user.id,
        content,
        message_type: "text",
        source,
      })

      if (error) throw error

      // Обновляем время последнего сообщения в чате
      await supabase.from("user_chats").update({ last_message_at: new Date().toISOString() }).eq("id", chatId)

      // Перезагружаем сообщения
      fetchMessages(chatId)

      // Отправляем уведомление в Telegram если сообщение из веб-приложения
      if (source === "webapp") {
        await notifyTelegram(chatId, content)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const notifyTelegram = async (chatId: string, content: string) => {
    try {
      // Получаем информацию о чате и участниках
      const { data: chat } = await supabase
        .from("user_chats")
        .select(`
          *,
          participant1:users!user_chats_participant1_id_fkey(tg_id, username),
          participant2:users!user_chats_participant2_id_fkey(tg_id, username)
        `)
        .eq("id", chatId)
        .single()

      if (!chat) return

      const otherUser = chat.participant1_id === user?.id ? chat.participant2 : chat.participant1

      // Отправляем уведомление через API
      await fetch("/api/bot/notify-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientTgId: otherUser.tg_id,
          senderUsername: user?.username,
          message: content,
          chatId: chatId,
        }),
      })
    } catch (error) {
      console.error("Error notifying Telegram:", error)
    }
  }

  const markAsRead = async (chatId: string) => {
    if (!user?.id) return

    try {
      await supabase.from("chat_messages").update({ is_read: true }).eq("chat_id", chatId).neq("sender_id", user.id)
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [user?.id])

  return {
    chats,
    messages,
    loading,
    fetchChats,
    fetchMessages,
    createOrGetChat,
    sendMessage,
    markAsRead,
  }
}
