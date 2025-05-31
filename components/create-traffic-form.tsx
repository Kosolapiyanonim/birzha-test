"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useTraffic } from "@/hooks/use-traffic"

interface CreateTrafficFormProps {
  onTrafficCreated?: () => void
}

export function CreateTrafficForm({ onTrafficCreated }: CreateTrafficFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    price: "",
    currency: "RUB" as "RUB" | "USDT" | "TON",
    traffic_type: "subscribers" as "subscribers" | "views" | "clicks" | "leads",
    geo: "RU",
  })
  const { createTrafficOffer } = useTraffic()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.quantity || !formData.price) return

    setLoading(true)
    try {
      await createTrafficOffer({
        title: formData.title,
        description: formData.description,
        quantity: Number.parseInt(formData.quantity),
        price: Number.parseInt(formData.price),
        currency: formData.currency,
        traffic_type: formData.traffic_type,
        geo: formData.geo,
      })

      setFormData({
        title: "",
        description: "",
        quantity: "",
        price: "",
        currency: "RUB",
        traffic_type: "subscribers",
        geo: "RU",
      })
      setOpen(false)
      onTrafficCreated?.()
    } catch (error) {
      console.error("Error creating traffic offer:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить трафик
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить предложение трафика</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Подписчики Telegram канала"
              className="bg-slate-900/50 border-slate-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Подробное описание трафика"
              className="bg-slate-900/50 border-slate-600"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="traffic_type">Тип трафика *</Label>
              <Select
                value={formData.traffic_type}
                onValueChange={(value: "subscribers" | "views" | "clicks" | "leads") =>
                  setFormData((prev) => ({ ...prev, traffic_type: value }))
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="subscribers" className="text-white">
                    Подписчики
                  </SelectItem>
                  <SelectItem value="views" className="text-white">
                    Просмотры
                  </SelectItem>
                  <SelectItem value="clicks" className="text-white">
                    Клики
                  </SelectItem>
                  <SelectItem value="leads" className="text-white">
                    Лиды
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="geo">География *</Label>
              <Select value={formData.geo} onValueChange={(value) => setFormData((prev) => ({ ...prev, geo: value }))}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="RU" className="text-white">
                    Россия
                  </SelectItem>
                  <SelectItem value="UA" className="text-white">
                    Украина
                  </SelectItem>
                  <SelectItem value="BY" className="text-white">
                    Беларусь
                  </SelectItem>
                  <SelectItem value="KZ" className="text-white">
                    Казахстан
                  </SelectItem>
                  <SelectItem value="US" className="text-white">
                    США
                  </SelectItem>
                  <SelectItem value="EU" className="text-white">
                    Европа
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Количество *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="1000"
              className="bg-slate-900/50 border-slate-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Цена *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="5000"
                className="bg-slate-900/50 border-slate-600"
                required
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
