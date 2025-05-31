"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  showDebugInfo?: boolean
}

export function ErrorDisplay({ error, onRetry, showDebugInfo = false }: ErrorDisplayProps) {
  const debugInfo = showDebugInfo
    ? {
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "Unknown",
        isTelegram: typeof window !== "undefined" && !!window.Telegram?.WebApp,
        timestamp: new Date().toISOString(),
      }
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-white">Ошибка загрузки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 text-sm text-center">{error}</p>

          {debugInfo && (
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
              <p className="text-xs text-slate-400 mb-2">Информация для отладки:</p>
              <div className="space-y-1 text-xs text-slate-300">
                <div>Telegram: {debugInfo.isTelegram ? "Да" : "Нет"}</div>
                <div>Время: {debugInfo.timestamp}</div>
                <div className="break-all">UA: {debugInfo.userAgent.slice(0, 50)}...</div>
              </div>
            </div>
          )}

          {onRetry && (
            <Button onClick={onRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-400">Если проблема повторяется, обратитесь в поддержку</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
