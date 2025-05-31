"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Users, Star, TrendingUp } from "lucide-react"
import { useCourses } from "@/hooks/use-courses"
import { ContactButton } from "@/components/contact-button"

export function CoursesMarketplace() {
  const { courses, loading } = useCourses()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getAccessTypeLabel = (type: string) => {
    switch (type) {
      case "free":
        return "Бесплатно"
      case "paid":
        return "Платно"
      case "referral":
        return "По реферальной ссылке"
      case "subscription":
        return "По подписке"
      default:
        return type
    }
  }

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case "free":
        return "bg-green-600"
      case "paid":
        return "bg-blue-600"
      case "referral":
        return "bg-purple-600"
      case "subscription":
        return "bg-orange-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Обучение</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">Создать курс</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Поиск курсов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Загрузка курсов...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          {searchTerm ? "Курсы не найдены" : "Нет доступных курсов"}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={20} className="text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">{course.title}</h3>
                    {course.is_promoted && (
                      <Badge className="bg-yellow-600 text-yellow-100">
                        <TrendingUp size={12} className="mr-1" />
                        Продвигается
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-300 mb-3">{course.description}</p>
                </div>
                <Badge className={getAccessTypeColor(course.access_type)}>
                  {getAccessTypeLabel(course.access_type)}
                </Badge>
              </div>

              <div className="flex items-center gap-6 mb-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{course.views_count} просмотров</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} />
                  <span>Рейтинг: 4.8</span>
                </div>
              </div>

              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-slate-300 border-slate-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {course.is_free || course.access_type === "free" ? "Бесплатно" : `${course.price.toLocaleString()} ₽`}
                </div>
                <div className="flex gap-2">
                  <ContactButton
                    userId={course.owner_id || ""}
                    source={`course_${course.id}`}
                    variant="outline"
                    className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  >
                    Написать автору
                  </ContactButton>
                  <Button className="bg-green-600 hover:bg-green-700">
                    {course.is_free || course.access_type === "free" ? "Получить доступ" : "Купить курс"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
