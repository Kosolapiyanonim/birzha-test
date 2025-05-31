"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTelegram } from "@/hooks/use-telegram"

export function TelegramDebug() {
  const { webApp, user } = useTelegram()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDebugInfo({
        isTelegram: !!window.Telegram?.WebApp,
        userAgent: navigator.userAgent,
        platform: webApp?.platform,
        version: webApp?.version,
        initData: webApp?.initData,
        user: user,
      })
    }
  }, [webApp, user])

  if (!debugInfo) return null

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mt-4">
      <CardHeader>
        <CardTitle className="text-white text-sm">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-xs">Telegram WebApp:</span>
          <Badge variant={debugInfo.isTelegram ? "default" : "destructive"}>
            {debugInfo.isTelegram ? "Да" : "Нет"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-xs">Platform:</span>
          <span className="text-white text-xs">{debugInfo.platform || "Unknown"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-xs">User ID:</span>
          <span className="text-white text-xs">{debugInfo.user?.id || "None"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-xs">Username:</span>
          <span className="text-white text-xs">@{debugInfo.user?.username || "None"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
