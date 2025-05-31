"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTelegram } from "@/hooks/use-telegram"
import { getSupabaseClient } from "@/lib/supabase"

export function DebugPanel() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user: tgUser } = useTelegram()
  const supabase = getSupabaseClient()

  const testConnection = async () => {
    setLoading(true)
    try {
      // Тест подключения к Supabase
      const { data, error } = await supabase.from("users").select("count").limit(1)

      setTestResult({
        supabase: error ? `Ошибка: ${error.message}` : "✅ Подключение OK",
        telegramUser: tgUser ? `✅ ID: ${tgUser.id}` : "❌ Нет данных",
        username: tgUser?.username ? `✅ @${tgUser.username}` : "❌ Нет username",
      })
    } catch (err) {
      setTestResult({
        error: `Критическая ошибка: ${err}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const testRegistration = async () => {
    if (!tgUser) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          tg_id: tgUser.id,
          username: tgUser.username || null,
          role: "executor",
        })
        .select()

      setTestResult({
        registration: error ? `Ошибка: ${error.message}` : "✅ Регистрация успешна",
        data: data,
      })
    } catch (err) {
      setTestResult({
        registration: `Критическая ошибка: ${err}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-sm">Диагностика</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button size="sm" onClick={testConnection} disabled={loading}>
            Тест подключения
          </Button>
          <Button size="sm" onClick={testRegistration} disabled={loading || !tgUser}>
            Тест регистрации
          </Button>
        </div>

        {testResult && (
          <div className="text-xs space-y-1">
            {Object.entries(testResult).map(([key, value]) => (
              <div key={key} className="text-slate-300">
                <strong>{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
