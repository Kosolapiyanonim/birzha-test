"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"

export interface UserChat {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  created_at: string
  other_user?: {
    id: string
    username: string
    first_name: string
  }
  last_message?: {
    content: string
    sender_id: string
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
  file_url?: string
  created_at: string
  sender?: {
    username: string
    first_name: string
  }
}

export function useUserChats() {
  const [chats, setChats] = useState<UserChat[]>([])
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
          participant1:users!user_chats_participant1_id_fkey(id, username, first_name),
          participant2:users!user_chats_participant2_id_fkey(id, username, first_name)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })

      if (error) throw error

      const chatsWithOtherUser =
        data?.map((chat) => ({
          ...chat,
          other_user: chat.participant1_id === user.id ? chat.participant2 : chat.participant1,
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
          sender:users(username, first_name)
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

  const createOrGetChat = async (otherUserId: string) => {
    if (!user?.id) return null

    try {
      // Проверяем, существует ли уже чат
      const { data: existingChat } = await supabase
        .from("user_chats")
        .select("*")
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`,
        )
        .single()

      if (existingChat) {
        return existingChat.id
      }

      // Создаем новый чат
      const { data: newChat, error } = await supabase
        .from("user_chats")
        .insert({
          participant1_id: user.id,
          participant2_id: otherUserId,
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

  const sendMessage = async (chatId: string, content: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from("chat_messages").insert({
        chat_id: chatId,
        sender_id: user.id,
        content,
        message_type: "text",
      })

      if (error) throw error

      // Обновляем время последнего сообщения в чате
      await supabase.from("user_chats").update({ last_message_at: new Date().toISOString() }).eq("id", chatId)

      // Перезагружаем сообщения
      fetchMessages(chatId)
    } catch (error) {
      console.error("Error sending message:", error)
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
