"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, AlertCircle, CheckCircle, Zap, Target, ArrowRight } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { DebugPanel } from "@/components/debug-panel"

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<"executor" | "employer" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const { setUserRole } = useUser()

  const handleRoleSelect = async () => {
    if (!selectedRole) return

    setLoading(true)
    setError(null)

    try {
      await setUserRole(selectedRole)
    } catch (error: any) {
      console.error("Error setting role:", error)
      setError(error?.message || "Ошибка при создании профиля. Попробуйте еще раз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 scale-150" />
            <div className="relative w-16 h-16 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Выберите свой путь
          </h1>
          <p className="text-slate-300 font-light">Как вы хотите использовать платформу?</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Executor Card */}
          <Card
            className={`cursor-pointer transition-all duration-500 border-2 backdrop-blur-xl group ${
              selectedRole === "executor"
                ? "border-emerald-400 bg-emerald-500/10 scale-105 shadow-2xl shadow-emerald-500/20"
                : "border-white/20 bg-white/5 hover:border-emerald-400/50 hover:bg-emerald-500/5 hover:scale-102"
            }`}
            onClick={() => setSelectedRole("executor")}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    selectedRole === "executor"
                      ? "bg-emerald-500/20 border border-emerald-400/30"
                      : "bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20"
                  }`}
                >
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-white text-xl font-semibold flex items-center">
                    Исполнитель
                    {selectedRole === "executor" && <CheckCircle className="w-5 h-5 ml-2 text-emerald-400" />}
                  </CardTitle>
                  <CardDescription className="text-slate-300 font-light">
                    Находите заказы и монетизируйте свои навыки
                  </CardDescription>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {["🎯 Персональные рекомендации", "⚡ Мгновенные уведомления", "💎 Премиум проекты"].map(
                  (feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-slate-300">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                      <span>{feature}</span>
                    </div>
                  ),
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Employer Card */}
          <Card
            className={`cursor-pointer transition-all duration-500 border-2 backdrop-blur-xl group ${
              selectedRole === "employer"
                ? "border-purple-400 bg-purple-500/10 scale-105 shadow-2xl shadow-purple-500/20"
                : "border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/5 hover:scale-102"
            }`}
            onClick={() => setSelectedRole("employer")}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    selectedRole === "employer"
                      ? "bg-purple-500/20 border border-purple-400/30"
                      : "bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20"
                  }`}
                >
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-white text-xl font-semibold flex items-center">
                    Заказчик
                    {selectedRole === "employer" && <CheckCircle className="w-5 h-5 ml-2 text-purple-400" />}
                  </CardTitle>
                  <CardDescription className="text-slate-300 font-light">
                    Создавайте проекты и находите лучших специалистов
                  </CardDescription>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {["🚀 Быстрый запуск проектов", "🎨 Умный подбор талантов", "🛡️ Гарантия качества"].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm text-slate-300">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl flex items-center space-x-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <button onClick={() => setShowDebug(!showDebug)} className="text-red-300 text-xs underline mt-1">
                Показать диагностику
              </button>
            </div>
          </div>
        )}

        {/* Debug Panel */}
        {showDebug && <DebugPanel />}

        {/* Action Button */}
        <Button
          onClick={handleRoleSelect}
          disabled={!selectedRole || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedRole === "executor"
              ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25"
              : selectedRole === "employer"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25"
                : "bg-gradient-to-r from-slate-600 to-slate-700"
          } text-white border-0 hover:scale-105`}
        >
          {loading ? (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Создание профиля...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Создать профиль</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center font-light">Роль можно изменить в настройках профиля</p>
      </div>
    </div>
  )
}
