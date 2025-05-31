"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import type { Database } from "@/lib/supabase"

type Service = Database["public"]["Tables"]["services"]["Row"] & {
  user: { username: string | null; rating: number } | null
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [myServices, setMyServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { user } = useUser()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchServices()
    if (user) {
      fetchMyServices()
    }
  }, [user])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          user:user_id (username, rating)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyServices = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          user:user_id (username, rating)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setMyServices(data || [])
    } catch (error) {
      console.error("Error fetching my services:", error)
    }
  }

  const createService = async (serviceData: {
    title: string
    description: string
    category: string
    price: number
    currency: "RUB" | "USDT" | "TON"
    delivery_time: number
    tags: string[]
  }) => {
    if (!user) throw new Error("User not authenticated")

    setCreating(true)
    try {
      const { data, error } = await supabase
        .from("services")
        .insert({
          ...serviceData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      await fetchMyServices()
      await fetchServices()
      return data
    } catch (error) {
      console.error("Error creating service:", error)
      throw error
    } finally {
      setCreating(false)
    }
  }

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { error } = await supabase
        .from("services")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", serviceId)
        .eq("user_id", user.id)

      if (error) throw error

      await fetchMyServices()
      await fetchServices()
    } catch (error) {
      console.error("Error updating service:", error)
      throw error
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { error } = await supabase.from("services").delete().eq("id", serviceId).eq("user_id", user.id)

      if (error) throw error

      await fetchMyServices()
      await fetchServices()
    } catch (error) {
      console.error("Error deleting service:", error)
      throw error
    }
  }

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    await updateService(serviceId, { is_active: isActive })
  }

  return {
    services,
    myServices,
    loading,
    creating,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    fetchServices,
    fetchMyServices,
  }
}
