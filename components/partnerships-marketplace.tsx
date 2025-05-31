"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Handshake, DollarSign, Users, Briefcase } from "lucide-react"
import { usePartnerships } from "@/hooks/use-partnerships"
import { ContactButton } from "@/components/contact-button"

export function PartnershipsMarketplace() {
  const { partnerships, loading } = usePartnerships()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPartnerships = partnerships.filter(
    (partnership) =>
      partnership.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partnership.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partnership.looking_for.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "investment":
        return <DollarSign size={20} className="text-green-400" />
      case "team":
        return <Users size={20} className="text-blue-400" />
      case "marketing":
        return <Briefcase size={20} className="text-purple-400" />
      case "collaboration":
        return <Handshake size={20} className="text-orange-400" />
      default:
        return <Handshake size={20} className="text-slate-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "investment":
        return "Инвестиции"
      case "team":
        return "Команда"
      case "marketing":
        return "Маркетинг"
      case "collaboration":
        return "Сотрудничество"
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "investment":
        return "bg-green-600"
      case "team":
        return "bg-blue-600"
      case "marketing":
        return "bg-purple-600"
      case "collaboration":
        return "bg-orange-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Партнёрства</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">Предложить партнёрство</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Поиск партнёрств..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Загрузка предложений...</div>
      ) : filteredPartnerships.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          {searchTerm ? "Партнёрства не найдены" : "Нет доступных предложений о партнёрстве"}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPartnerships.map((partnership) => (
            <Card key={partnership.id} className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(partnership.type)}
                    <h3 className="text-xl font-semibold text-white">{partnership.title}</h3>
                  </div>
                  <p className="text-slate-300 mb-3">{partnership.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getTypeColor(partnership.type)}>{getTypeLabel(partnership.type)}</Badge>
                  <Badge variant={partnership.status === "active" ? "default" : "secondary"}>
                    {partnership.status === "active"
                      ? "Активно"
                      : partnership.status === "closed"
                        ? "Закрыто"
                        : "Приостановлено"}
                  </Badge>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Ищем:</h4>
                <p className="text-slate-200">{partnership.looking_for}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {partnership.budget > 0
                    ? `Бюджет: ${partnership.budget.toLocaleString()} ${partnership.currency}`
                    : "Бюджет по договоренности"}
                </div>
                <div className="flex gap-2">
                  <ContactButton
                    userId={partnership.proposer_id || ""}
                    source={`partnership_${partnership.id}`}
                    variant="outline"
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    Написать
                  </ContactButton>
                  <Button className="bg-green-600 hover:bg-green-700">Откликнуться</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
