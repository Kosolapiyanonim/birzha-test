"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Users, Shield, Zap } from "lucide-react"

interface OnboardingProps {
  onComplete: () => void
}

const slides = [
  {
    id: 1,
    title: "Добро пожаловать в будущее фриланса",
    description: "Революционная платформа, которая объединяет талантливых исполнителей с амбициозными проектами",
    icon: Sparkles,
    gradient: "from-violet-600 via-purple-600 to-blue-600",
    particles: true,
  },
  {
    id: 2,
    title: "Для визионеров и заказчиков",
    description: "Превратите свои идеи в реальность с помощью лучших специалистов",
    icon: Zap,
    gradient: "from-blue-600 via-cyan-600 to-teal-600",
    features: [
      { text: "Создание заказов за минуты", icon: "⚡" },
      { text: "Умный подбор исполнителей", icon: "🎯" },
      { text: "Прозрачная система оплаты", icon: "💎" },
      { text: "Гарантия качества", icon: "🏆" },
    ],
  },
  {
    id: 3,
    title: "Для талантливых исполнителей",
    description: "Монетизируйте свои навыки и работайте над интересными проектами",
    icon: Users,
    gradient: "from-emerald-600 via-green-600 to-teal-600",
    features: [
      { text: "Персонализированные заказы", icon: "🎨" },
      { text: "Мгновенные уведомления", icon: "🔔" },
      { text: "Безопасные сделки", icon: "🛡️" },
      { text: "Рост репутации", icon: "📈" },
    ],
  },
  {
    id: 4,
    title: "Экосистема доверия",
    description: "Передовые технологии безопасности и система репутации нового поколения",
    icon: Shield,
    gradient: "from-orange-600 via-red-600 to-pink-600",
    features: [
      { text: "Блокчейн верификация", icon: "🔐" },
      { text: "AI-модерация контента", icon: "🤖" },
      { text: "Эскроу платежи", icon: "💰" },
      { text: "24/7 поддержка", icon: "🚀" },
    ],
  },
  {
    id: 5,
    title: "Готовы изменить игру?",
    description: "Присоединяйтесь к революции в мире удаленной работы",
    icon: Sparkles,
    gradient: "from-indigo-600 via-purple-600 to-pink-600",
    isLast: true,
    cta: "Начать путешествие",
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }

  const slide = slides[currentSlide]
  const IconComponent = slide.icon

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20`} />
        {slide.particles && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl transform transition-all duration-700 hover:scale-105">
        <CardContent className="p-8 text-center text-white relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

          <div className="relative z-10">
            {/* Progress indicator */}
            <div className="flex justify-center space-x-3 mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === currentSlide
                      ? "w-8 bg-white shadow-lg shadow-white/50"
                      : index < currentSlide
                        ? "w-4 bg-white/60"
                        : "w-4 bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Icon with glow effect */}
            <div className="relative mb-6">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} rounded-full blur-xl opacity-50 scale-150`}
              />
              <div className="relative w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title with gradient text */}
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-tight">
              {slide.title}
            </h2>

            {/* Description */}
            <p className="text-white/90 mb-8 leading-relaxed text-lg font-light">{slide.description}</p>

            {/* Features with premium styling */}
            {slide.features && (
              <div className="grid grid-cols-1 gap-3 mb-8">
                {slide.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-white/90 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="text-white hover:bg-white/10 disabled:opacity-30 backdrop-blur-sm border border-white/20"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>

              <div className="flex space-x-3">
                {slide.isLast ? (
                  <Button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/25 border-0 transition-all duration-300 hover:scale-105"
                  >
                    {slide.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={nextSlide}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Далее
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Skip button */}
            {!slide.isLast && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="mt-6 text-white/60 hover:text-white hover:bg-white/5 text-sm font-light"
              >
                Пропустить введение
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
