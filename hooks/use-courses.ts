"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import type { Database } from "@/lib/supabase"

type Course = Database["public"]["Tables"]["courses"]["Row"] & {
  users: { username: string | null; rating: number } | null
  is_purchased?: boolean
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    if (!user) return

    try {
      // Получаем все курсы
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          *,
          users:owner_id (username, rating)
        `)
        .order("is_promoted", { ascending: false })
        .order("created_at", { ascending: false })

      if (coursesError) throw coursesError

      // Получаем покупки пользователя
      const { data: purchases } = await supabase.from("course_purchases").select("course_id").eq("user_id", user.id)

      const purchasedCourseIds = new Set(purchases?.map((p) => p.course_id) || [])

      // Добавляем флаг покупки
      const coursesWithPurchases =
        coursesData?.map((course) => ({
          ...course,
          is_purchased: purchasedCourseIds.has(course.id),
        })) || []

      setCourses(coursesWithPurchases)

      // Мои курсы (созданные мной)
      const myCourses = coursesWithPurchases.filter((course) => course.owner_id === user.id)
      setMyCourses(myCourses)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const createCourse = async (courseData: {
    title: string
    description: string
    is_free: boolean
    price: number
    access_type: "free" | "paid" | "referral" | "subscription"
    tags: string[]
  }) => {
    if (!user) throw new Error("User not found")

    const { data, error } = await supabase
      .from("courses")
      .insert({
        ...courseData,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    await fetchCourses()
    return data
  }

  const purchaseCourse = async (courseId: string, amount: number, currency: "RUB" | "USDT" | "TON") => {
    if (!user) throw new Error("User not found")

    const { error } = await supabase.from("course_purchases").insert({
      course_id: courseId,
      user_id: user.id,
      amount_paid: amount,
      currency,
    })

    if (error) throw error

    await fetchCourses()
  }

  return {
    courses,
    myCourses,
    loading,
    fetchCourses,
    createCourse,
    purchaseCourse,
  }
}
