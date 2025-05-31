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
import { usePartnerships } from "@/hooks/use-partnerships"

interface CreatePartnershipFormProps {
  onPartnershipCreated?: () => void
}

export function CreatePartnershipForm({ onPartnershipCreated }: CreatePartnershipFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    looking_for: "",
    type: "collaboration" as "investment" | "team" | "marketing" | "collaboration",
    budget: "",
    currency: "RUB" as "RUB" | "USDT" | "TON",
  })
  const { createPartnership } = usePartnerships()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim() || !formData.looking_for.trim()) return

    setLoading(true)
    try {
      await createPartnership({
        title: formData.title,
        description: formData.description,
        looking_for: formData.looking_for,
        type: formData.type,
        budget: formData.budget ? Number.parseInt(formData.budget) : 0,
        currency: formData.currency,
      })

      setFormData({
        title: "",
        description: "",
        looking_for: "",
        type: "collaboration",
        budget: "",
        currency: "RUB",
      })
      setOpen(false)
      onPartnershipCreated?.()
    } catch (error) {
      console.error("Error creating partnership:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить партнёрство
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить предложение партнёрства</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название проекта *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Название вашего проекта"
              className="bg-slate-900/50 border-slate-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание проекта *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Подробное описание проекта и целей"
              className="bg-slate-900/50 border-slate-600"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="looking_for">Кого ищем *</Label>
            <Textarea
              id="looking_for"
              value={formData.looking_for}
              onChange={(e) => setFormData((prev) => ({ ...prev, looking_for: e.target.value }))}
              placeholder="Описание требований к партнёру"
              className="bg-slate-900/50 border-slate-600"
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Тип партнёрства *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "investment" | "team" | "marketing" | "collaboration") =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="bg-slate-900/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="collaboration" className="text-white">
                  Сотрудничество
                </SelectItem>
                <SelectItem value="investment" className="text-white">
                  Инвестиции
                </SelectItem>
                <SelectItem value="team" className="text-white">
                  Команда
                </SelectItem>
                <SelectItem value="marketing" className="text-white">
                  Маркетинг
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Бюджет</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                placeholder="0 = договорной"
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
