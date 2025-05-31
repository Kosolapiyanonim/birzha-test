"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; webhook_url?: string } | null>(null)

  const setupWebhook = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/bot/setup", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Ошибка подключения к серверу",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center">Настройка Telegram бота</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 text-sm text-center">
            Нажмите кнопку ниже, чтобы настроить webhook для вашего Telegram бота
          </p>

          <Button
            onClick={setupWebhook}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Настройка...
              </>
            ) : (
              "Настроить webhook"
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <div className="flex items-center space-x-2">
                {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-medium">{result.message}</span>
              </div>
              {result.webhook_url && <p className="text-xs mt-2 opacity-75">Webhook URL: {result.webhook_url}</p>}
            </div>
          )}

          <div className="text-xs text-slate-400 space-y-2">
            <p>📝 Инструкция:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Создайте бота через @BotFather</li>
              <li>Добавьте BOT_TOKEN в переменные окружения</li>
              <li>Нажмите "Настроить webhook"</li>
              <li>Настройте кнопку WebApp в @BotFather</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
