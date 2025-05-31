"use client"

import { useEffect, useState } from "react"

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    chat_instance?: string
    chat_type?: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: "light" | "dark"
  themeParams: {
    link_color: string
    button_color: string
    button_text_color: string
    secondary_bg_color: string
    hint_color: string
    bg_color: string
    text_color: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Даем время на загрузку Telegram WebApp API
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        if (window.Telegram?.WebApp) {
          // Реальный Telegram WebApp
          const tg = window.Telegram.WebApp
          setWebApp(tg)
          setUser(tg.initDataUnsafe.user || null)

          tg.ready()
          tg.expand()
        } else {
          // Fallback для тестирования в браузере
          console.log("Telegram WebApp не найден, используем тестовые данные")
          const mockUser: TelegramUser = {
            id: 7245112093, // Ваш реальный ID
            first_name: "Test",
            username: "nontagtelega",
          }
          setUser(mockUser)
        }
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return { webApp, user, isLoading }
}
