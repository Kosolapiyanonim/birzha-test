"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Search, ArrowLeft } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function ChatContactsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return

      setLoading(true)
      try {
        // Получаем всех пользователей, кроме текущего
        const { data, error } = await supabase.from("users").select("id, tg_id, username, role").neq("id", user.id)

        if (error) throw error
        setContacts(data || [])
      } catch (error) {
        console.error("Ошибка при загрузке контактов:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [user?.id, supabase])

  // Фильтрация контактов по поисковому запросу
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tg_id.toString().includes(searchTerm),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="max-w-xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2 text-slate-300 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <CardTitle className="text-white">Контакты для чата</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Поиск по имени или ID..."
              className="pl-8 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {searchTerm ? "Контакты не найдены" : "Нет доступных контактов"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">
                      {contact.username ? `@${contact.username}` : `Пользователь ${contact.tg_id}`}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {contact.role === "executor" ? "Исполнитель" : "Заказчик"} • ID: {contact.tg_id}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/chat/${contact.tg_id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Написать
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
