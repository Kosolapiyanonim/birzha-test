"use client"

import { useState } from "react"
import { ChatList } from "./chat-list"
import { ChatWindow } from "./chat-window"

export function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<{
    orderId: string
    receiverId: string
    orderTitle: string
  } | null>(null)

  const handleChatSelect = (orderId: string, receiverId: string, orderTitle: string) => {
    setSelectedChat({ orderId, receiverId, orderTitle })
  }

  const handleBack = () => {
    setSelectedChat(null)
  }

  if (selectedChat) {
    return (
      <ChatWindow
        orderId={selectedChat.orderId}
        receiverId={selectedChat.receiverId}
        orderTitle={selectedChat.orderTitle}
        onBack={handleBack}
      />
    )
  }

  return <ChatList onChatSelect={handleChatSelect} />
}
