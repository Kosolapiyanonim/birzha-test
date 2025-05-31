"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"

export interface Ad {
  id: string
  channel_name: string
  owner_id: string | null
  description: string | null
  price: number | null
  currency: "RUB" | "USDT" | "TON"
  tags: string[] | null
  views_count: number
  subscribers_count: number
  is_promoted: boolean
  status: "active" | "sold" | "paused"
  created_at: string
  owner?: {
    id: string
    username: string | null
    tg_id: number
  }
}

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const fetchAds = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("ads")
        .select(`
          *,
          owner:users(id, username, tg_id)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAds(data || [])
    } catch (error) {
      console.error("Error fetching ads:", error)
    } finally {
      setLoading(false)
    }
  }

  const createAd = async (
    adData: Omit<Ad, "id" | "owner_id" | "views_count" | "is_promoted" | "status" | "created_at" | "owner">,
  ) => {
    if (!user?.id) throw new Error("User not authenticated")

    const { error } = await supabase.from("ads").insert({
      ...adData,
      owner_id: user.id,
    })

    if (error) throw error
    fetchAds()
  }

  useEffect(() => {
    fetchAds()
  }, [])

  return {
    ads,
    loading,
    fetchAds,
    createAd,
  }
}
