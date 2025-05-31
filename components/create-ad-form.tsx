"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { useAds } from "@/hooks/use-ads"

interface CreateAdFormProps {
  onAdCreated?: () => void
}

export function CreateAdForm({ onAdCreated }: CreateAdFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    channel_name: "",
    description: "",
    price: "",
    currency: "RUB" as "RUB" | "USDT" | "TON",
    subscribers_count: "",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const { createAd } = useAds()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.channel_name.trim()) return

    setLoading(true)
    try {
      await createAd({
        channel_name: formData.channel_name,
        description: formData.description || null,
        price: formData.price ? Number.parseInt(formData.price) : null,
        currency: formData.currency,
        subscribers_count: formData.subscribers_count ? Number.parseInt(formData.subscribers_count) : 0,
        tags: formData.tags.length > 0 ? formData.tags : null,
      })

      setFormData({
        channel_name: "",
        description: "",
        price: "",
        currency: "RUB",
        subscribers_count: "",
        tags: [],
      })
      setOpen(false)
      onAdCreated?.()
    } catch (error) {
      console.error("Error creating ad:", error)
    } finally {
      setLoading(false)
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
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить канал
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить рекламное предложение</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="channel_name">Название канала *</Label>
            <Input
              id="channel_name"
              value={formData.channel_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, channel_name: e.target.value }))}
              placeholder="@channel_name или название"
              className="bg-slate-900/50 border-slate-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Описание канала и условий размещения рекламы"
              className="bg-slate-900/50 border-slate-600"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="subscribers_count">Количество подписчиков</Label>
            <Input
              id="subscribers_count"
              type="number"
              value={formData.subscribers_count}
              onChange={(e) => setFormData((prev) => ({ ...prev, subscribers_count: e.target.value }))}
              placeholder="10000"
              className="bg-slate-900/50 border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Цена</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="1000"
                className="bg-slate-900/50 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="currency">Валюта</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: "RUB" | "USDT" | "TON") => setFormData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="RUB" className="text-white">
                    RUB
                  </SelectItem>
                  <SelectItem value="USDT" className="text-white">
                    USDT
                  </SelectItem>
                  <SelectItem value="TON" className="text-white">
                    TON
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Теги</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Добавить тег"
                className="bg-slate-900/50 border-slate-600"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-blue-600/20 text-blue-300">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
