"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTraffic } from "@/hooks/use-traffic"
import { CreateTrafficForm } from "./create-traffic-form"
import { TrendingUp, Search, Filter, MessageCircle } from "lucide-react"
import { useEnhancedChats } from "@/hooks/use-enhanced-chats"

export function TrafficMarketplace() {
  const { trafficOffers, loading } = useTraffic()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedGeo, setSelectedGeo] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const { createOrGetChat } = useEnhancedChats()

  const trafficTypes = [
    { value: "all", label: "Все типы" },
    { value: "subscribers", label: "Подписчики" },
    { value: "views", label: "Просмотры" },
    { value: "clicks", label: "Клики" },
    { value: "leads", label: "Лиды" },
  ]

  const geoOptions = [
    { value: "all", label: "Все страны" },
    { value: "RU", label: "Россия" },
    { value: "UA", label: "Украина" },
    { value: "BY", label: "Беларусь" },
    { value: "KZ", label: "Казахстан" },
    { value: "US", label: "США" },
    { value: "EU", label: "Европа" },
  ]

  const filteredOffers = trafficOffers
    .filter((offer) => {
      const matchesSearch =
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === "all" || offer.traffic_type === selectedType
      const matchesGeo = selectedGeo === "all" || offer.geo === selectedGeo
      return matchesSearch && matchesType && matchesGeo
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.price - b.price
        case "price_high":
          return b.price - a.price
        case "quantity":
          return b.quantity - a.quantity
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const handleWriteMessage = useCallback(
    async (offer) => {
      if (!offer.seller_id) return
      const chatId = await createOrGetChat(offer.seller_id, "service", offer.id, `Трафик: ${offer.title}`)
      if (chatId) {
        window.location.href = `/?chat=${chatId}`
      }
    },
    [createOrGetChat],
  )

  const handleBuyTraffic = useCallback(
    async (offer) => {
      if (!offer.seller_id) return
      const chatId = await createOrGetChat(offer.seller_id, "service", offer.id, `Покупка трафика: ${offer.title}`)
      if (chatId) {
        window.location.href = `/?chat=${chatId}`
      }
    },
    [createOrGetChat],
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Трафик</h1>
          <CreateTrafficForm />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded mb-4"></div>
                <div className="h-3 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded mb-4"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Трафик</h1>
        <CreateTrafficForm onTrafficCreated={() => window.location.reload()} />
      </div>

      {/* Фильтры */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Поиск трафика..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Тип трафика" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {trafficTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGeo} onValueChange={setSelectedGeo}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="География" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {geoOptions.map((geo) => (
                  <SelectItem key={geo.value} value={geo.value} className="text-white hover:bg-slate-700">
                    {geo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="newest" className="text-white hover:bg-slate-700">
                  Новые
                </SelectItem>
                <SelectItem value="price_low" className="text-white hover:bg-slate-700">
                  Цена ↑
                </SelectItem>
                <SelectItem value="price_high" className="text-white hover:bg-slate-700">
                  Цена ↓
                </SelectItem>
                <SelectItem value="quantity" className="text-white hover:bg-slate-700">
                  Количество
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-slate-300">
              <Filter className="w-4 h-4 mr-2" />
              Найдено: {filteredOffers.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список предложений */}
      {filteredOffers.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Предложения трафика не найдены</p>
            <p className="text-slate-500 text-sm mt-2">Попробуйте изменить фильтры поиска</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <Card
              key={offer.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-blue-500/50 transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant="secondary"
                    className={`${
                      offer.traffic_type === "subscribers"
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : offer.traffic_type === "views"
                          ? "bg-green-600/20 text-green-300 border border-green-500/30"
                          : offer.traffic_type === "clicks"
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                            : "bg-orange-600/20 text-orange-300 border border-orange-500/30"
                    }`}
                  >
                    {offer.traffic_type === "subscribers"
                      ? "Подписчики"
                      : offer.traffic_type === "views"
                        ? "Просмотры"
                        : offer.traffic_type === "clicks"
                          ? "Клики"
                          : "Лиды"}
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    {offer.geo}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg leading-tight">{offer.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm line-clamp-3">{offer.description}</p>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
                    {offer.quantity.toLocaleString()} шт.
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      offer.status === "active"
                        ? "border-green-500 text-green-400"
                        : offer.status === "sold"
                          ? "border-red-500 text-red-400"
                          : "border-yellow-500 text-yellow-400"
                    }`}
                  >
                    {offer.status === "active" ? "Доступно" : offer.status === "sold" ? "Продано" : "На паузе"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <div className="text-white font-semibold">
                    {offer.price.toLocaleString()} {offer.currency}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => handleWriteMessage(offer)}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Написать
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                      onClick={() => handleBuyTraffic(offer)}
                      disabled={offer.status !== "active"}
                    >
                      Купить
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">@{offer.seller?.username || "Пользователь"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
