import { type NextRequest, NextResponse } from "next/server"

// Обработчик webhook от Telegram
export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Проверяем токен бота для безопасности
    const botToken = process.env.BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    // Обрабатываем сообщения
    if (update.message) {
      const chatId = update.message.chat.id
      const text = update.message.text
      const user = update.message.from

      if (text === "/start") {
        await sendWelcomeMessage(chatId, user.first_name, botToken)
      }
    }

    // Обрабатываем callback кнопки
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id
      const data = update.callback_query.data
      const callbackQueryId = update.callback_query.id

      await handleCallbackQuery(chatId, data, callbackQueryId, botToken)
    }

    // Добавить в функцию POST после существующих обработчиков

    // Обрабатываем ответы на сообщения
    if (update.callback_query?.data?.startsWith("reply_")) {
      const chatId = update.callback_query.data.replace("reply_", "")
      const userId = update.callback_query.from.id

      await handleReplyMode(userId, chatId, botToken)
    }

    // Обрабатываем текстовые сообщения (ответы в чатах)
    if (update.message?.text && !update.message.text.startsWith("/")) {
      const userId = update.message.from.id
      const messageText = update.message.text

      await handleChatMessage(userId, messageText, botToken)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendWelcomeMessage(chatId: number, firstName: string, botToken: string) {
  // Получаем URL нашего Vercel приложения
  const webappUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.WEBAPP_URL || "https://your-app.vercel.app"

  const message = `🚀 Добро пожаловать, ${firstName}!

Это биржа заказов, где:
👨‍💻 Исполнители находят работу  
🧑‍💼 Заказчики находят специалистов

Нажмите кнопку ниже, чтобы открыть приложение:`

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 Открыть биржу",
          web_app: { url: webappUrl },
        },
      ],
      [
        {
          text: "📊 Мой профиль",
          callback_data: "profile",
        },
        {
          text: "💬 Поддержка",
          callback_data: "support",
        },
      ],
    ],
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      reply_markup: keyboard,
    }),
  })
}

async function handleCallbackQuery(chatId: number, data: string, callbackQueryId: string, botToken: string) {
  let responseText = ""

  switch (data) {
    case "profile":
      responseText = "👤 Ваш профиль доступен в WebApp приложении"
      break
    case "support":
      responseText = "💬 Для поддержки напишите администратору"
      break
    default:
      responseText = "Неизвестная команда"
  }

  // Отвечаем на callback
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: "✅",
    }),
  })

  // Отправляем сообщение
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: responseText,
    }),
  })
}

async function handleReplyMode(telegramUserId: number, chatId: string, botToken: string) {
  // Сохраняем состояние пользователя для ответа
  await fetch(`${process.env.VERCEL_URL || process.env.WEBAPP_URL}/api/bot/set-reply-mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegramUserId, chatId }),
  })

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramUserId,
      text: "💬 Напишите ваш ответ следующим сообщением:",
    }),
  })
}

async function handleChatMessage(telegramUserId: number, messageText: string, botToken: string) {
  try {
    // Отправляем сообщение в веб-приложение
    const response = await fetch(`${process.env.VERCEL_URL || process.env.WEBAPP_URL}/api/bot/process-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramUserId, messageText }),
    })

    if (response.ok) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramUserId,
          text: "✅ Сообщение отправлено!",
        }),
      })
    }
  } catch (error) {
    console.error("Error processing chat message:", error)
  }
}
