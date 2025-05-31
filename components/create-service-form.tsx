"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useServices } from "@/hooks/use-services"
import { Plus, X, Loader2 } from "lucide-react"

interface CreateServiceFormProps {
  onServiceCreated?: () => void
}

const categories = [
  "Веб-разработка",
  "Мобильная разработка",
  "Дизайн",
  "Маркетинг",
  "Копирайтинг",
  "SEO",
  "Переводы",
  "Видеомонтаж",
  "Фотография",
  "Консультации",
  "Другое",
]

export function CreateServiceForm({ onServiceCreated }: CreateServiceFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    currency: "RUB" as "RUB" | "USDT" | "TON",
    delivery_time: "1",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const { creating, createService } = useServices()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      return
    }

    try {
      await createService({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number.parseInt(formData.price),
        currency: formData.currency,
        delivery_time: Number.parseInt(formData.delivery_time),
        tags: formData.tags,
      })

      // Сброс формы
      setFormData({
        title: "",
        description: "",
        category: "",
        price: "",
        currency: "RUB",
        delivery_time: "1",
        tags: [],
      })
      setNewTag("")
      setOpen(false)
      onServiceCreated?.()
    } catch (error) {
      console.error("Error creating service:", error)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Создать услугу
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Создать новую услугу</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Название услуги
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Например: Создание сайта на React"
              className="bg-slate-900/50 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Описание
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Подробно опишите что входит в услугу..."
              className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Категория</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_time" className="text-slate-300">
                Срок выполнения (дни)
              </Label>
              <Input
                id="delivery_time"
                type="number"
                min="1"
                value={formData.delivery_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, delivery_time: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-slate-300">
                Цена
              </Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="1000"
                className="bg-slate-900/50 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Валюта</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: "RUB" | "USDT" | "TON") => setFormData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
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

          <div className="space-y-2">
            <Label className="text-slate-300">Теги</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Добавить тег"
                className="bg-slate-900/50 border-slate-600 text-white"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Добавить
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300 border border-blue-500/30"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-300">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={creating}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать услугу"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
