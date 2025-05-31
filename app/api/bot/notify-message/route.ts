import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

// Список проблемных ID, для которых не нужно отправлять уведомления
const PROBLEMATIC_IDS = ["2c63b8fb-48a5-409f-b51b-e32037ce93b1"]

export async function POST(request: NextRequest) {
  try {
    const { toId, fromId, message, source } = await request.json()

    console.log("Notification request:", { toId, fromId, message, source })

    // Проверяем, является ли ID проблемным
    if (PROBLEMATIC_IDS.includes(toId)) {
      console.log("Уведомление пропущено: ID в списке проблемных:", toId)
      return NextResponse.json(
        {
          success: false,
          error: "Notification skipped for problematic ID",
        },
        { status: 200 },
      )
    }

    const botToken = process.env.BOT_TOKEN

    if (!botToken) {
      console.error("Bot token not configured")
      return NextResponse.json({ error: "Bot token not configured" }, { status: 200 })
    }

    const supabase = getSupabaseClient()

    // Пытаемся найти реальный Telegram ID пользователя
    let telegramId: number | null = null

    // Сначала проверяем, является ли toId уже Telegram ID (числом)
    const directTelegramId = Number.parseInt(toId)
    if (!isNaN(directTelegramId) && directTelegramId > 0) {
      telegramId = directTelegramId
      console.log("Using direct Telegram ID:", telegramId)
    } else {
      // Если это UUID, ищем пользователя в базе данных
      try {
        const { data: user } = await supabase.from("users").select("tg_id").eq("id", toId).single()

        if (user?.tg_id) {
          telegramId = user.tg_id
          console.log("Found Telegram ID from UUID:", telegramId)
        }
      } catch (error) {
        console.error("Error finding user by UUID:", error)
      }
    }

    if (!telegramId) {
      console.warn("Could not find Telegram ID for user:", toId)
      return NextResponse.json(
        {
          success: false,
          error: "Telegram ID not found",
          message: "User does not have a valid Telegram ID",
        },
        { status: 200 },
      )
    }

    // Получаем информацию об отправителе
    let senderInfo = "пользователя"
    try {
      const senderTelegramId = Number.parseInt(fromId)
      if (!isNaN(senderTelegramId)) {
        const { data: sender } = await supabase.from("users").select("username").eq("tg_id", senderTelegramId).single()

        if (sender?.username) {
          senderInfo = `@${sender.username}`
        }
      } else {
        // Если fromId это UUID
        const { data: sender } = await supabase.from("users").select("username").eq("id", fromId).single()

        if (sender?.username) {
          senderInfo = `@${sender.username}`
        }
      }
    } catch (error) {
      console.error("Error getting sender info:", error)
    }

    const webappUrl =
      process.env.WEBAPP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://your-app.vercel.app")

    // Отправляем уведомление в Telegram
    const telegramMessage = `💬 Новое сообщение от ${senderInfo}:

"${message}"

📍 Источник: ${source || "чат"}

👆 Ответить в веб-приложении`

    const telegramPayload = {
      chat_id: telegramId,
      text: telegramMessage,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "💬 Открыть чат",
              web_app: {
                url: `${webappUrl}/chat/${fromId}?source=${source || "notification"}`,
              },
            },
          ],
        ],
      },
    }

    console.log("Sending to Telegram:", { chat_id: telegramId, message_length: telegramMessage.length })

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(telegramPayload),
      })

      const responseData = await response.json()
      console.log("Telegram API response:", responseData)

      if (!response.ok) {
        console.error("Telegram API error:", responseData)

        // Добавляем ID в список проблемных, если ошибка связана с чатом
        if (responseData.error_code === 400 && responseData.description.includes("chat not found")) {
          console.log("Adding to problematic IDs:", toId)
          // В реальном приложении здесь можно было бы сохранить этот ID в базу данных
        }

        return NextResponse.json(
          {
            success: false,
            error: "Telegram notification failed",
            details: responseData,
          },
          { status: 200 },
        )
      }

      return NextResponse.json({ success: true, data: responseData })
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json(
        {
          success: false,
          error: "Fetch error",
          details: fetchError.message,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error in notify-message endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 200 },
    )
  }
}
