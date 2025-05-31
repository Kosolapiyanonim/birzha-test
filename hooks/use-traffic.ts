"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"

export interface TrafficOffer {
  id: string
  seller_id: string | null
  title: string
  description: string
  quantity: number
  price: number
  currency: "RUB" | "USDT" | "TON"
  traffic_type: "subscribers" | "views" | "clicks" | "leads"
  geo: string
  status: "active" | "sold" | "paused"
  created_at: string
  seller?: {
    id: string
    username: string | null
    tg_id: number
  }
}

export function useTraffic() {
  const [trafficOffers, setTrafficOffers] = useState<TrafficOffer[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const fetchTrafficOffers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("traffic_offers")
        .select(`
          *,
          seller:users(id, username, tg_id)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTrafficOffers(data || [])
    } catch (error) {
      console.error("Error fetching traffic offers:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTrafficOffer = async (
    offerData: Omit<TrafficOffer, "id" | "seller_id" | "status" | "created_at" | "seller">,
  ) => {
    if (!user?.id) throw new Error("User not authenticated")

    const { error } = await supabase.from("traffic_offers").insert({
      ...offerData,
      seller_id: user.id,
    })

    if (error) throw error
    fetchTrafficOffers()
  }

  useEffect(() => {
    fetchTrafficOffers()
  }, [])

  return {
    trafficOffers,
    loading,
    fetchTrafficOffers,
    createTrafficOffer,
  }
}
