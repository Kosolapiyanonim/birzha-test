import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { user_id, message, type } = await request.json()
    const botToken = process.env.BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    // Определяем эмодзи по типу уведомления
    const emoji =
      {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌",
      }[type] || "📢"

    const fullMessage = `${emoji} ${message}`

    // Отправляем уведомление через Telegram Bot API напрямую
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user_id,
        text: fullMessage,
        parse_mode: "HTML",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Telegram API error:", errorData)
      throw new Error(`Telegram API error: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
