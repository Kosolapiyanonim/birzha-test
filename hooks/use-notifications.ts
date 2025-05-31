"use client"

import { useTelegram } from "./use-telegram"

export function useNotifications() {
  const { user } = useTelegram()

  const sendNotification = async (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    if (!user) return

    try {
      await fetch("/api/bot/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          message,
          type,
        }),
      })
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  return { sendNotification }
}
