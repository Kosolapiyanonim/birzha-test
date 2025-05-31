"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Users, Eye, TrendingUp, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface ChannelInfo {
  username: string
  name: string
  description: string
  subscribers: number
  views: number
  category: string
}

export default function CreateAdPage() {
  const [mounted, setMounted] = useState(false)
  const [url, setUrl] = useState("")
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("RUB")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const extractChannelInfo = async (inputUrl: string) => {
    setIsLoading(true)
    try {
      const urlObj = new URL(inputUrl)

      // Извлекаем username из URL
      let username = ""
      if (urlObj.hostname === "tgstat.ru") {
        const pathParts = urlObj.pathname.split("/")
        const channelIndex = pathParts.indexOf("channel")
        if (channelIndex !== -1 && pathParts[channelIndex + 1]) {
          username = pathParts[channelIndex + 1].replace("@", "")
        }
      } else if (urlObj.hostname === "t.me") {
        username = urlObj.pathname.replace("/", "").replace("@", "")
      }

      if (!username) {
        throw new Error("Не удалось извлечь имя канала")
      }

      // Симулируем получение данных о канале
      // В реальном проекте здесь был бы API запрос к TGStat
      const mockChannelInfo: ChannelInfo = {
        username,
        name: `Канал @${username}`,
        description: "Описание канала будет загружено из TGStat API",
        subscribers: Math.floor(Math.random() * 100000) + 1000,
        views: Math.floor(Math.random() * 1000000) + 10000,
        category: "Новости и СМИ",
      }

      setChannelInfo(mockChannelInfo)
    } catch (error) {
      alert("Некорректная ссылка на канал")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    extractChannelInfo(url)
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

  const handleCreateAd = async () => {
    if (!channelInfo || !price) return

    setIsCreating(true)
    try {
      // Симулируем создание рекламы
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("Рекламное предложение создано!")
      router.push("/")
    } catch (error) {
      alert("Ошибка при создании предложения")
    } finally {
      setIsCreating(false)
    }
  }

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-2xl font-bold">Добавить канал для рекламы</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Информация о канале
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url">Ссылка на канал</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://tgstat.ru/channel/@yourchannel или https://t.me/yourchannel"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">Поддерживаются ссылки с TGStat.ru и t.me</p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Получить информацию о канале"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {channelInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Превью канала</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{channelInfo.name}</h3>
                <p className="text-gray-600">{channelInfo.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {channelInfo.subscribers.toLocaleString()} подписчиков
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {channelInfo.views.toLocaleString()} просмотров
                  </div>
                </div>
                <Badge variant="secondary">{channelInfo.category}</Badge>
              </div>

              <Button variant="outline" asChild>
                <a
                  href={`https://tgstat.ru/channel/@${channelInfo.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  TGStat
                </a>
              </Button>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold">Настройки рекламного предложения</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена за размещение</Label>
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      placeholder="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RUB">RUB</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="TON">TON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Дополнительное описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Условия размещения, форматы рекламы..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Теги</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Добавить тег"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    Добавить
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateAd} className="w-full" disabled={!price || isCreating}>
                {isCreating ? "Создание..." : "Создать рекламное предложение"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
