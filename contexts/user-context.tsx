"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useTelegram } from "@/hooks/use-telegram"
import { getSupabaseClient } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  setUserRole: (role: "executor" | "employer") => Promise<void>
  switchRole: (role: "executor" | "employer") => Promise<void>
  retry: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: tgUser, isLoading: tgLoading } = useTelegram()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!tgLoading && tgUser) {
      initializeUser()
    } else if (!tgLoading && !tgUser) {
      setError("Не удалось получить данные пользователя Telegram")
      setLoading(false)
    }
  }, [tgUser, tgLoading])

  const initializeUser = async () => {
    if (!tgUser) return

    try {
      setError(null)

      // Проверяем подключение к Supabase
      const { error: connectionError } = await supabase.from("users").select("count").limit(1)
      if (connectionError) {
        throw new Error(`Ошибка подключения к базе данных: ${connectionError.message}`)
      }

      // Проверяем существующего пользователя
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("tg_id", tgUser.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(`Ошибка поиска пользователя: ${fetchError.message}`)
      }

      if (existingUser) {
        setUser(existingUser)
      } else {
        setUser(null)
      }
    } catch (error: any) {
      console.error("Error initializing user:", error)
      setError(error.message || "Неизвестная ошибка при инициализации")
    } finally {
      setLoading(false)
    }
  }

  const setUserRole = async (role: "executor" | "employer") => {
    if (!tgUser) throw new Error("Данные пользователя Telegram недоступны")

    try {
      // Сначала проверяем, существует ли пользователь
      const { data: existingUser } = await supabase.from("users").select("*").eq("tg_id", tgUser.id).single()

      let newUser
      if (existingUser) {
        // Обновляем существующего пользователя
        const { data, error } = await supabase.from("users").update({ role }).eq("tg_id", tgUser.id).select().single()

        if (error) throw new Error(`Ошибка обновления профиля: ${error.message}`)
        newUser = data
      } else {
        // Создаем нового пользователя
        const { data, error } = await supabase
          .from("users")
          .insert({
            tg_id: tgUser.id,
            username: tgUser.username || null,
            role,
          })
          .select()
          .single()

        if (error) throw new Error(`Ошибка создания профиля: ${error.message}`)
        newUser = data
      }

      setUser(newUser)
      setError(null)
    } catch (error: any) {
      console.error("Error setting user role:", error)
      throw error
    }
  }

  const switchRole = async (role: "executor" | "employer") => {
    if (!user) throw new Error("Пользователь не найден")

    try {
      const { data, error } = await supabase.from("users").update({ role }).eq("id", user.id).select().single()

      if (error) throw new Error(`Ошибка смены роли: ${error.message}`)

      setUser(data)
      setError(null)
    } catch (error: any) {
      console.error("Error switching role:", error)
      throw error
    }
  }

  const retry = () => {
    setError(null)
    setLoading(true)
    if (tgUser) {
      initializeUser()
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, error, setUserRole, switchRole, retry }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
