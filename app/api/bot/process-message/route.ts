import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { telegramUserId, messageText } = await request.json()

    // Находим пользователя по Telegram ID
    const { data: user } = await supabase.from("users").select("id").eq("tg_id", telegramUserId).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Получаем активный чат пользователя (последний чат)
    const { data: activeChat } = await supabase
      .from("user_chats")
      .select("id")
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .single()

    if (!activeChat) {
      return NextResponse.json({ error: "No active chat found" }, { status: 404 })
    }

    // Сохраняем сообщение в базу данных
    await supabase.from("chat_messages").insert({
      chat_id: activeChat.id,
      sender_id: user.id,
      content: messageText,
      message_type: "text",
      source: "telegram",
    })

    // Обновляем время последнего сообщения
    await supabase.from("user_chats").update({ last_message_at: new Date().toISOString() }).eq("id", activeChat.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing message:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
