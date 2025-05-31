"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ContactButtonProps {
  userId: string
  source?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  children?: React.ReactNode
}

export function ContactButton({
  userId,
  source = "unknown",
  variant = "default",
  size = "default",
  className = "",
  children,
}: ContactButtonProps) {
  const router = useRouter()

  const handleContact = () => {
    // Исправляем путь на /chat/[id]
    router.push(`/chat/${userId}?source=${source}`)
  }

  return (
    <Button variant={variant} size={size} onClick={handleContact} className={className}>
      <MessageCircle size={16} className="mr-2" />
      {children || "Написать"}
    </Button>
  )
}
