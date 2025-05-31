"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { Plus } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

interface CreateOrderFormProps {
  onOrderCreated: () => void
}

export function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "web-dev", // Устанавливаем значение по умолчанию вместо пустой строки
    budget: "",
    currency: "RUB" as "RUB" | "USDT" | "TON",
  })

  const { user } = useUser()
  const supabase = getSupabaseClient()
  const { sendNotification } = useNotifications()

  const categories = [
    { value: "web-dev", label: "Веб-разработка" },
    { value: "mobile-dev", label: "Мобильная разработка" },
    { value: "design", label: "Дизайн" },
    { value: "copywriting", label: "Копирайтинг" },
    { value: "marketing", label: "Маркетинг" },
    { value: "seo", label: "SEO" },
    { value: "translation", label: "Переводы" },
    { value: "video", label: "Видеомонтаж" },
    { value: "other", label: "Другое" },
  ]

  // Маппинг для сохранения в базу данных
  const categoryMapping: Record<string, string> = {
    "web-dev": "Веб-разработка",
    "mobile-dev": "Мобильная разработка",
    design: "Дизайн",
    copywriting: "Копирайтинг",
    marketing: "Маркетинг",
    seo: "SEO",
    translation: "Переводы",
    video: "Видеомонтаж",
    other: "Другое",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: categoryMapping[formData.category], // Используем маппинг
        budget: Number.parseInt(formData.budget),
        currency: formData.currency,
        status: "active", // Явно устанавливаем статус "active"
      })

      if (error) throw error

      setFormData({
        title: "",
        description: "",
        category: "web-dev",
        budget: "",
        currency: "RUB",
      })
      setIsOpen(false)
      onOrderCreated()
      await sendNotification(`✅ Заказ "${formData.title}" успешно создан!`)
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        Создать заказ
      </Button>
    )
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Создать новый заказ</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-slate-300">
              Название
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white"
              placeholder="Краткое описание задачи"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">
              Описание
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
              placeholder="Подробное описание задачи, требования, сроки..."
              required
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-slate-300">
              Категория
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-white hover:bg-slate-700">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget" className="text-slate-300">
                Бюджет
              </Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="bg-slate-900/50 border-slate-600 text-white"
                placeholder="1000"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-slate-300">
                Валюта
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value: "RUB" | "USDT" | "TON") => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="RUB" className="text-white hover:bg-slate-700">
                    RUB
                  </SelectItem>
                  <SelectItem value="USDT" className="text-white hover:bg-slate-700">
                    USDT
                  </SelectItem>
                  <SelectItem value="TON" className="text-white hover:bg-slate-700">
                    TON
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              {loading ? "Создание..." : "Создать заказ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
