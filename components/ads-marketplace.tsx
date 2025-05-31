"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Eye, TrendingUp } from "lucide-react"
import { useAds } from "@/hooks/use-ads"
import { ContactButton } from "@/components/contact-button"

export function AdsMarketplace() {
  const { ads, loading } = useAds()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAds = ads.filter(
    (ad) =>
      ad.channel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Реклама</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">Разместить рекламу</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Поиск каналов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Загрузка рекламных предложений...</div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          {searchTerm ? "Реклама не найдена" : "Нет доступных рекламных предложений"}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAds.map((ad) => (
            <Card key={ad.id} className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">@{ad.channel_name}</h3>
                  <p className="text-slate-300 mb-3">{ad.description}</p>
                </div>
                <Badge variant={ad.status === "active" ? "default" : "secondary"} className="ml-4">
                  {ad.status === "active" ? "Активно" : ad.status === "sold" ? "Продано" : "Приостановлено"}
                </Badge>
              </div>

              <div className="flex items-center gap-6 mb-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{ad.subscribers_count.toLocaleString()} подписчиков</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{ad.views_count} просмотров</span>
                </div>
                {ad.is_promoted && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <TrendingUp size={16} />
                    <span>Продвигается</span>
                  </div>
                )}
              </div>

              {ad.tags && ad.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {ad.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-slate-300 border-slate-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {ad.price ? `${ad.price.toLocaleString()} ${ad.currency}` : "Цена по договоренности"}
                </div>
                <div className="flex gap-2">
                  <ContactButton
                    userId={ad.owner_id || ""}
                    source={`ad_${ad.id}`}
                    variant="outline"
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    Написать
                  </ContactButton>
                  <Button className="bg-green-600 hover:bg-green-700">Купить</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
