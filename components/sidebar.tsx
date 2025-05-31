"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  FileText,
  Search,
  TrendingUp,
  User,
  Settings,
  Menu,
  X,
  RefreshCw,
  Shield,
  HelpCircle,
  BookOpen,
  Megaphone,
  Star,
  Handshake,
  Plus,
  MessageCircle,
} from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)
  const { user, switchRole } = useUser()

  const menuItems = [
    ...(user?.role === "employer"
      ? [
          { id: "my-orders", label: "Мои заказы", icon: Briefcase },
          { id: "applications", label: "Заявки", icon: FileText },
        ]
      : []),
    ...(user?.role === "executor"
      ? [
          { id: "find-orders", label: "Найти заказы", icon: Search },
          { id: "my-applications", label: "Мои заявки", icon: FileText },
        ]
      : []),
    { id: "services", label: "Услуги", icon: Briefcase },
    { id: "my-services", label: "Мои услуги", icon: Settings },
    {
      id: "direct-chat",
      label: "Чаты",
      icon: MessageCircle,
      onClick: () => {
        if (typeof window !== "undefined") {
          window.location.href = "/chat"
        }
        setIsOpen(false)
      },
    },
    { id: "courses", label: "Обучение", icon: BookOpen },
    { id: "ads", label: "Реклама", icon: Megaphone },
    { id: "traffic", label: "Трафик", icon: TrendingUp },
    { id: "partnerships", label: "Партнёрства", icon: Handshake },
    { id: "promotion", label: "Продвижение", icon: Star },
    { id: "support", label: "Поддержка", icon: HelpCircle },
    { id: "profile", label: "Профиль", icon: User },
    { id: "settings", label: "Настройки", icon: Settings },
    ...(user?.is_admin ? [{ id: "admin", label: "Админ-панель", icon: Shield }] : []),
  ]

  const toggleSidebar = () => setIsOpen(!isOpen)

  const handleRoleSwitch = async () => {
    if (!user) return

    setSwitchingRole(true)
    try {
      const newRole = user.role === "executor" ? "employer" : "executor"
      await switchRole(newRole)

      // Переключаем на соответствующий раздел
      const newSection = newRole === "employer" ? "my-orders" : "find-orders"
      onSectionChange(newSection)

      setIsOpen(false)
    } catch (error) {
      console.error("Error switching role:", error)
    } finally {
      setSwitchingRole(false)
    }
  }

  return (
    <>
      {/* Mobile menu button - перемещен вправо */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-white hover:bg-slate-700"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`
        fixed left-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 z-40 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Биржа</h2>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-slate-400 capitalize">
              {user?.role === "executor" ? "Исполнитель" : "Заказчик"}
              {user?.is_admin && <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">ADMIN</span>}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRoleSwitch}
              disabled={switchingRole}
              className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto"
            >
              {switchingRole ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                `→ ${user?.role === "executor" ? "Заказчик" : "Исполнитель"}`
              )}
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start text-left transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick()
                  } else {
                    onSectionChange(item.id)
                    setIsOpen(false)
                  }
                }}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            )
          })}

          {/* Special button for adding ads */}
          <div className="pt-2 border-t border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => {
                // Navigate to ads creation page
                if (typeof window !== "undefined") {
                  window.location.href = "/ads/new"
                }
                setIsOpen(false)
              }}
            >
              <Plus className="w-4 h-4 mr-3" />
              Добавить канал
            </Button>
          </div>
        </nav>
      </div>
    </>
  )
}
