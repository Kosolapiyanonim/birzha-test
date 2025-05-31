"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Star, Clock, DollarSign } from "lucide-react"
import { useServices } from "@/hooks/use-services"
import { CreateServiceForm } from "@/components/create-service-form"
import { useUser } from "@/contexts/user-context"
import { ContactButton } from "@/components/contact-button" // Импортируем ContactButton

export function ServicesMarketplace() {
  const { services, loading, error } = useServices()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const { user } = useUser()

  useEffect(() => {
    if (services) {
      setFilteredServices(
        services.filter(
          (service) =>
            service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
        ),
      )
    }
  }, [services, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Услуги</h1>
        <CreateServiceForm />
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Поиск услуг..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <Filter size={18} className="mr-2" />
          Фильтры
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-slate-400">Загрузка услуг...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-400">Ошибка загрузки услуг</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-400">Услуги не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white">{service.title}</CardTitle>
                  <Badge variant="outline" className="bg-blue-900/50 text-blue-300 border-blue-700">
                    {service.category}
                  </Badge>
                </div>
                <CardDescription className="text-slate-300">
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{service.rating.toFixed(1)}</span>
                    <span className="text-slate-400">•</span>
                    <span>{service.reviews_count} отзывов</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">{service.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-slate-400">
                    <Clock size={14} className="mr-1" />
                    <span>Срок: {service.delivery_time} дней</span>
                  </div>
                  <div className="flex items-center font-medium text-white">
                    <DollarSign size={14} className="mr-1" />
                    <span>
                      {service.price} {service.currency}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
                {/* Заменяем кнопку "Написать" на ContactButton */}
                <ContactButton
                  userId={service.owner_id.toString()}
                  source={`service_${service.id}`}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  Написать
                </ContactButton>
                <Button className="bg-blue-600 hover:bg-blue-700">Заказать</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
