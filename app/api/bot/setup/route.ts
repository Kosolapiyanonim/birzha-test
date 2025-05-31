import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    // Получаем URL нашего Vercel приложения
    const webhookUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/bot/webhook`
      : process.env.WEBAPP_URL
        ? `${process.env.WEBAPP_URL}/api/bot/webhook`
        : "https://your-app.vercel.app/api/bot/webhook"

    // Устанавливаем webhook
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    })

    const result = await response.json()

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook установлен успешно",
        webhook_url: webhookUrl,
      })
    } else {
      return NextResponse.json(
        {
          error: "Ошибка установки webhook",
          details: result,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
