"use client"

import { useState, useEffect } from "react"
import { UserProvider, useUser } from "@/contexts/user-context"
import { RoleSelection } from "@/components/role-selection"
import { Sidebar } from "@/components/sidebar"
import { CreateOrderForm } from "@/components/create-order-form"
import { OrdersList } from "@/components/orders-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, MessageCircle } from "lucide-react"
import { UserStats } from "@/components/user-stats"
import { Onboarding } from "@/components/onboarding"
import { TelegramDebug } from "@/components/telegram-debug"
import { DebugPanel } from "@/components/debug-panel"
import { ErrorDisplay } from "@/components/error-boundary"
import { ApplicationsManager } from "@/components/applications-manager"
import { MyApplications } from "@/components/my-applications"
import { AdminPanel } from "@/components/admin-panel"
import { SupportTicketForm } from "@/components/support-ticket-form"
import { CoursesMarketplace } from "@/components/courses-marketplace"
import { AdsMarketplace } from "@/components/ads-marketplace"
import { TrafficMarketplace } from "@/components/traffic-marketplace"
import { PartnershipsMarketplace } from "@/components/partnerships-marketplace"
import { ServicesMarketplace } from "@/components/services-marketplace"
import { MyServices } from "@/components/my-services"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

function MainApp() {
  const { user, loading, error, retry } = useUser()
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("onboarding_completed")
    }
    return true
  })
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== "undefined") {
      const role = user?.role
      if (role === "employer") return "my-orders"
      if (role === "executor") return "find-orders"
    }
    return "find-orders"
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const router = useRouter()

  // Проверяем URL параметры для открытия чата
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const chatId = urlParams.get("chat")

      // Если есть параметр chat, перенаправляем на страницу чата
      if (chatId && user?.tg_id) {
        router.push(`/chat/${chatId}?source=redirect`)
      }
    }
  }, [router, user?.tg_id])

  const handleOnboardingComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true")
    }
    setShowOnboarding(false)
  }

  // Показываем ошибку, если есть
  if (error) {
    return <ErrorDisplay error={error} onRetry={retry} showDebugInfo={true} />
  }

  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-slate-300">Загрузка приложения...</p>
          <p className="text-xs text-slate-400">Подключение к серверу</p>
        </div>
      </div>
    )
  }

  // Показываем онбординг
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  // Показываем выбор роли
  if (!user) {
    return <RoleSelection />
  }

  const renderContent = () => {
    switch (activeSection) {
      case "my-orders":
        return (
          <div className="space-y-6">
            <UserStats />
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Мои заказы</h1>
              <CreateOrderForm onOrderCreated={() => setRefreshTrigger((prev) => prev + 1)} />
            </div>
            <OrdersList key={refreshTrigger} showMyOrders={true} />
          </div>
        )

      case "find-orders":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Найти заказы</h1>
            <OrdersList key={refreshTrigger} />
          </div>
        )

      case "applications":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Заявки на мои заказы</h1>
            <ApplicationsManager />
          </div>
        )

      case "my-applications":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Мои заявки</h1>
            <MyApplications />
          </div>
        )

      case "direct-chat":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Чаты</h1>
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardContent className="p-6">
                <div className="text-center py-4">
                  <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Новая система чатов</h2>
                  <p className="text-slate-300 mb-6">
                    Мы обновили систему чатов! Теперь вы можете общаться с пользователями в новом интерфейсе.
                  </p>
                  <Button onClick={() => router.push("/chat")} className="bg-blue-600 hover:bg-blue-700">
                    Открыть новые чаты
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "support":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Поддержка</h1>
            <SupportTicketForm />
          </div>
        )

      case "admin":
        return (
          <div className="space-y-6">
            <UserStats />
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-8 h-8 text-red-400" />
              <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
            </div>
            <AdminPanel />
          </div>
        )

      case "promotion":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Продвижение</h1>
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Продвинуть заказ в ТОП</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Продвиньте свой заказ в топ результатов поиска для большей видимости
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <span className="text-white">24 часа в ТОП</span>
                    <Badge className="bg-blue-600 text-white">500 RUB</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <span className="text-white">7 дней в ТОП</span>
                    <Badge className="bg-blue-600 text-white">2000 RUB</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "profile":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Профиль</h1>
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Информация о профиле</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm">Telegram ID</label>
                  <p className="text-white font-mono">{user.tg_id}</p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Username</label>
                  <p className="text-white">@{user.username || "Не указан"}</p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Роль</label>
                  <Badge className="ml-2 capitalize bg-blue-600 text-white">
                    {user.role === "executor" ? "Исполнитель" : "Заказчик"}
                  </Badge>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Рейтинг</label>
                  <p className="text-white">{user.rating.toFixed(1)} ⭐</p>
                </div>
                {user.is_admin && (
                  <div>
                    <label className="text-slate-300 text-sm">Статус</label>
                    <Badge className="ml-2 bg-red-600 text-white">Администратор</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            <TelegramDebug />
            <DebugPanel />
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <UserStats />
            <h1 className="text-2xl font-bold text-white">Настройки</h1>
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Функция в разработке</p>
              </CardContent>
            </Card>
          </div>
        )
      case "courses":
        return (
          <div className="space-y-6">
            <UserStats />
            <CoursesMarketplace />
          </div>
        )

      case "ads":
        return (
          <div className="space-y-6">
            <UserStats />
            <AdsMarketplace />
          </div>
        )

      case "traffic":
        return (
          <div className="space-y-6">
            <UserStats />
            <TrafficMarketplace />
          </div>
        )

      case "partnerships":
        return (
          <div className="space-y-6">
            <UserStats />
            <PartnershipsMarketplace />
          </div>
        )
      case "services":
        return (
          <div className="space-y-6">
            <UserStats />
            <ServicesMarketplace />
          </div>
        )

      case "my-services":
        return (
          <div className="space-y-6">
            <UserStats />
            <MyServices />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 p-6 md:ml-0 overflow-auto">
        <div className="max-w-4xl mx-auto pt-16 md:pt-0">{renderContent()}</div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  )
}
