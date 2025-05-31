"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCourses } from "@/hooks/use-courses"
import { X, Plus } from "lucide-react"

interface CreateCourseFormProps {
  onClose: () => void
}

export function CreateCourseForm({ onClose }: CreateCourseFormProps) {
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_free: true,
    price: 0,
    access_type: "free" as "free" | "paid" | "referral" | "subscription",
  })

  const { createCourse } = useCourses()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createCourse({
        ...formData,
        tags,
      })
      onClose()
    } catch (error) {
      console.error("Error creating course:", error)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-white">Создать курс</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-slate-300">
                Название курса
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
                placeholder="Введите название курса"
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
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="Подробное описание курса, что изучат студенты..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="access_type" className="text-slate-300">
                  Тип доступа
                </Label>
                <Select
                  value={formData.access_type}
                  onValueChange={(value: "free" | "paid" | "referral" | "subscription") =>
                    setFormData({ ...formData, access_type: value, is_free: value === "free" })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="free" className="text-white hover:bg-slate-700">
                      Бесплатный
                    </SelectItem>
                    <SelectItem value="paid" className="text-white hover:bg-slate-700">
                      Платный
                    </SelectItem>
                    <SelectItem value="subscription" className="text-white hover:bg-slate-700">
                      По подписке
                    </SelectItem>
                    <SelectItem value="referral" className="text-white hover:bg-slate-700">
                      За реферала
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!formData.is_free && (
                <div>
                  <Label htmlFor="price" className="text-slate-300">
                    Цена (₽)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="1000"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-slate-300">Теги</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Добавить тег"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="icon"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-blue-600/20 border border-blue-400/30 rounded-lg px-2 py-1"
                  >
                    <span className="text-blue-400 text-sm">{tag}</span>
                    <button type="button" onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-300">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl"
              >
                {loading ? "Создание..." : "Создать курс"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/20 text-white hover:bg-white/10 rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
