"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"

export interface Partnership {
  id: string
  proposer_id: string | null
  title: string
  description: string
  looking_for: string
  type: "investment" | "team" | "marketing" | "collaboration"
  budget: number
  currency: "RUB" | "USDT" | "TON"
  status: "active" | "closed" | "paused"
  created_at: string
  proposer?: {
    id: string
    username: string | null
    tg_id: number
  }
}

export function usePartnerships() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const fetchPartnerships = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("partnerships")
        .select(`
          *,
          proposer:users(id, username, tg_id)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPartnerships(data || [])
    } catch (error) {
      console.error("Error fetching partnerships:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPartnership = async (
    partnershipData: Omit<Partnership, "id" | "proposer_id" | "status" | "created_at" | "proposer">,
  ) => {
    if (!user?.id) throw new Error("User not authenticated")

    const { error } = await supabase.from("partnerships").insert({
      ...partnershipData,
      proposer_id: user.id,
    })

    if (error) throw error
    fetchPartnerships()
  }

  useEffect(() => {
    fetchPartnerships()
  }, [])

  return {
    partnerships,
    loading,
    fetchPartnerships,
    createPartnership,
  }
}
