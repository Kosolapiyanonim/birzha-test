"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useServices } from "@/hooks/use-services"
import { CreateServiceForm } from "./create-service-form"
import { Edit, Trash2, Eye, Clock, Star } from "lucide-react"

export function MyServices() {
  const { myServices, loading, toggleServiceStatus, deleteService } = useServices()

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await toggleServiceStatus(serviceId, !currentStatus)
    } catch (error) {
      console.error("Error toggling service status:", error)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту услугу?")) {
      try {
        await deleteService(serviceId)
      } catch (error) {
        console.error("Error deleting service:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Мои услуги</h1>
          <CreateServiceForm />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Мои услуги</h1>
        <CreateServiceForm onServiceCreated={() => window.location.reload()} />
      </div>

      {myServices.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400 mb-4">У вас пока нет созданных услуг</p>
            <CreateServiceForm onServiceCreated={() => window.location.reload()} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myServices.map((service) => (
            <Card key={service.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border border-blue-500/30">
                    {service.category}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    {service.is_promoted && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">⭐ ТОП</Badge>
                    )}
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Активна" : "Неактивна"}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-white text-lg leading-tight">{service.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm line-clamp-2">{service.description}</p>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {service.views_count}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {service.orders_count} заказов
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.delivery_time} дн.
                  </div>
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {tag}
                      </Badge>
                    ))}
                    {service.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        +{service.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <div className="text-white font-semibold">
                    {service.price.toLocaleString()} {service.currency}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={service.is_active}
                      onCheckedChange={() => handleToggleStatus(service.id, service.is_active)}
                    />
                    <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
