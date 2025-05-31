"use client"

import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"

export function useViews() {
  const { user } = useUser()
  const supabase = getSupabaseClient()

  const trackOrderView = async (orderId: string) => {
    if (!user) return

    try {
      // Добавляем просмотр (если уже есть, то ничего не произойдет из-за UNIQUE constraint)
      await supabase.from("order_views").insert({
        order_id: orderId,
        viewer_id: user.id,
      })
    } catch (error) {
      // Игнорируем ошибки дублирования
      console.log("View already tracked or error:", error)
    }
  }

  const trackProfileView = async (profileId: string) => {
    if (!user || user.id === profileId) return // Не считаем просмотры собственного профиля

    try {
      await supabase.from("profile_views").insert({
        profile_id: profileId,
        viewer_id: user.id,
      })
    } catch (error) {
      console.log("Profile view already tracked or error:", error)
    }
  }

  const getOrderViews = async (orderId: string) => {
    try {
      const { data, error } = await supabase.from("order_views").select("count").eq("order_id", orderId)

      if (error) throw error
      return data?.length || 0
    } catch (error) {
      console.error("Error getting order views:", error)
      return 0
    }
  }

  const getProfileViews = async (profileId: string) => {
    try {
      const { data, error } = await supabase.from("profile_views").select("count").eq("profile_id", profileId)

      if (error) throw error
      return data?.length || 0
    } catch (error) {
      console.error("Error getting profile views:", error)
      return 0
    }
  }

  return {
    trackOrderView,
    trackProfileView,
    getOrderViews,
    getProfileViews,
  }
}
