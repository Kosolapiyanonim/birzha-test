import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side singleton
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          tg_id: number
          username: string | null
          role: "executor" | "employer"
          rating: number
          views_count: number
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tg_id: number
          username?: string | null
          role: "executor" | "employer"
          rating?: number
          views_count?: number
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tg_id?: number
          username?: string | null
          role?: "executor" | "employer"
          rating?: number
          views_count?: number
          is_admin?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          budget: number
          currency: "RUB" | "USDT" | "TON"
          is_promoted: boolean
          status: "new" | "in_progress" | "completed" | "cancelled" | "dispute"
          views_count: number
          order_number: string
          executor_id: string | null
          confirmed_by_customer: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          budget: number
          currency?: "RUB" | "USDT" | "TON"
          is_promoted?: boolean
          status?: "new" | "in_progress" | "completed" | "cancelled" | "dispute"
          views_count?: number
          order_number?: string
          executor_id?: string | null
          confirmed_by_customer?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          budget?: number
          currency?: "RUB" | "USDT" | "TON"
          is_promoted?: boolean
          status?: "new" | "in_progress" | "completed" | "cancelled" | "dispute"
          views_count?: number
          order_number?: string
          executor_id?: string | null
          confirmed_by_customer?: boolean
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          is_free: boolean
          price: number
          access_type: "free" | "paid" | "referral" | "subscription"
          owner_id: string | null
          tags: string[] | null
          views_count: number
          is_promoted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          is_free?: boolean
          price?: number
          access_type?: "free" | "paid" | "referral" | "subscription"
          owner_id?: string | null
          tags?: string[] | null
          views_count?: number
          is_promoted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          is_free?: boolean
          price?: number
          access_type?: "free" | "paid" | "referral" | "subscription"
          owner_id?: string | null
          tags?: string[] | null
          views_count?: number
          is_promoted?: boolean
          created_at?: string
        }
      }
      ads: {
        Row: {
          id: string
          channel_name: string
          owner_id: string | null
          description: string | null
          price: number | null
          currency: "RUB" | "USDT" | "TON"
          tags: string[] | null
          views_count: number
          subscribers_count: number
          is_promoted: boolean
          status: "active" | "sold" | "paused"
          created_at: string
        }
        Insert: {
          id?: string
          channel_name: string
          owner_id?: string | null
          description?: string | null
          price?: number | null
          currency?: "RUB" | "USDT" | "TON"
          tags?: string[] | null
          views_count?: number
          subscribers_count?: number
          is_promoted?: boolean
          status?: "active" | "sold" | "paused"
          created_at?: string
        }
        Update: {
          id?: string
          channel_name?: string
          owner_id?: string | null
          description?: string | null
          price?: number | null
          currency?: "RUB" | "USDT" | "TON"
          tags?: string[] | null
          views_count?: number
          subscribers_count?: number
          is_promoted?: boolean
          status?: "active" | "sold" | "paused"
          created_at?: string
        }
      }
      traffic_offers: {
        Row: {
          id: string
          seller_id: string | null
          title: string
          description: string
          quantity: number
          price: number
          currency: "RUB" | "USDT" | "TON"
          traffic_type: "subscribers" | "views" | "clicks" | "leads"
          geo: string
          status: "active" | "sold" | "paused"
          created_at: string
        }
        Insert: {
          id?: string
          seller_id?: string | null
          title: string
          description: string
          quantity: number
          price: number
          currency?: "RUB" | "USDT" | "TON"
          traffic_type?: "subscribers" | "views" | "clicks" | "leads"
          geo?: string
          status?: "active" | "sold" | "paused"
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string | null
          title?: string
          description?: string
          quantity?: number
          price?: number
          currency?: "RUB" | "USDT" | "TON"
          traffic_type?: "subscribers" | "views" | "clicks" | "leads"
          geo?: string
          status?: "active" | "sold" | "paused"
          created_at?: string
        }
      }
      partnerships: {
        Row: {
          id: string
          proposer_id: string | null
          title: string
          description: string
          looking_for: string
          type: "investment" | "team" | "marketing" | "collaboration"
          budget: number
          currency: "RUB" | "USDT" | "TON"
          status: "active" | "closed" | "paused"
          created_at: string
        }
        Insert: {
          id?: string
          proposer_id?: string | null
          title: string
          description: string
          looking_for: string
          type?: "investment" | "team" | "marketing" | "collaboration"
          budget?: number
          currency?: "RUB" | "USDT" | "TON"
          status?: "active" | "closed" | "paused"
          created_at?: string
        }
        Update: {
          id?: string
          proposer_id?: string | null
          title?: string
          description?: string
          looking_for?: string
          type?: "investment" | "team" | "marketing" | "collaboration"
          budget?: number
          currency?: "RUB" | "USDT" | "TON"
          status?: "active" | "closed" | "paused"
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string | null
          type: "learning" | "premium" | "vip"
          valid_until: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: "learning" | "premium" | "vip"
          valid_until: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: "learning" | "premium" | "vip"
          valid_until?: string
          is_active?: boolean
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          order_id: string
          user_id: string
          comment: string
          status: "new" | "accepted" | "declined"
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          comment: string
          status?: "new" | "accepted" | "declined"
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          comment?: string
          status?: "new" | "accepted" | "declined"
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          message: string
          is_resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          message: string
          is_resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          message?: string
          is_resolved?: boolean
          created_at?: string
        }
      }
      order_views: {
        Row: {
          id: string
          order_id: string
          viewer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          viewer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          viewer_id?: string
          created_at?: string
        }
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewer_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          order_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          order_id: string
          employer_id: string
          executor_id: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          employer_id: string
          executor_id: string
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          employer_id?: string
          executor_id?: string
          last_message_at?: string
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          bonus_amount: number
          status: "pending" | "confirmed" | "paid"
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          bonus_amount?: number
          status?: "pending" | "confirmed" | "paid"
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          bonus_amount?: number
          status?: "pending" | "confirmed" | "paid"
          created_at?: string
        }
      }
      course_purchases: {
        Row: {
          id: string
          course_id: string | null
          user_id: string | null
          amount_paid: number | null
          currency: "RUB" | "USDT" | "TON"
          created_at: string
        }
        Insert: {
          id?: string
          course_id?: string | null
          user_id?: string | null
          amount_paid?: number | null
          currency?: "RUB" | "USDT" | "TON"
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string | null
          user_id?: string | null
          amount_paid?: number | null
          currency?: "RUB" | "USDT" | "TON"
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          price: number
          currency: "RUB" | "USDT" | "TON"
          delivery_time: number
          is_active: boolean
          is_promoted: boolean
          views_count: number
          orders_count: number
          tags: string[] | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          price: number
          currency?: "RUB" | "USDT" | "TON"
          delivery_time?: number
          is_active?: boolean
          is_promoted?: boolean
          views_count?: number
          orders_count?: number
          tags?: string[] | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          price?: number
          currency?: "RUB" | "USDT" | "TON"
          delivery_time?: number
          is_active?: boolean
          is_promoted?: boolean
          views_count?: number
          orders_count?: number
          tags?: string[] | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      service_orders: {
        Row: {
          id: string
          service_id: string
          buyer_id: string
          seller_id: string
          status: "pending" | "in_progress" | "completed" | "cancelled" | "dispute"
          amount: number
          currency: "RUB" | "USDT" | "TON"
          requirements: string | null
          delivery_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          buyer_id: string
          seller_id: string
          status?: "pending" | "in_progress" | "completed" | "cancelled" | "dispute"
          amount: number
          currency?: "RUB" | "USDT" | "TON"
          requirements?: string | null
          delivery_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          buyer_id?: string
          seller_id?: string
          status?: "pending" | "in_progress" | "completed" | "cancelled" | "dispute"
          amount?: number
          currency?: "RUB" | "USDT" | "TON"
          requirements?: string | null
          delivery_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_chats: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          last_message_at: string
          created_at: string
          chat_type: "direct" | "order" | "service" | "ad" | "partnership"
          related_id: string | null
          title: string | null
        }
        Insert: {
          id?: string
          participant1_id: string
          participant2_id: string
          last_message_at?: string
          created_at?: string
          chat_type?: "direct" | "order" | "service" | "ad" | "partnership"
          related_id?: string | null
          title?: string | null
        }
        Update: {
          id?: string
          participant1_id?: string
          participant2_id?: string
          last_message_at?: string
          created_at?: string
          chat_type?: "direct" | "order" | "service" | "ad" | "partnership"
          related_id?: string | null
          title?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          is_read: boolean
          message_type: "text" | "image" | "file"
          file_url: string | null
          created_at: string
          telegram_message_id: number | null
          source: "webapp" | "telegram"
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          is_read?: boolean
          message_type?: "text" | "image" | "file"
          file_url?: string | null
          created_at?: string
          telegram_message_id?: number | null
          source?: "webapp" | "telegram"
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          message_type?: "text" | "image" | "file"
          file_url?: string | null
          created_at?: string
          telegram_message_id?: number | null
          source?: "webapp" | "telegram"
        }
      }
      reviews: {
        Row: {
          id: string
          service_id: string
          order_id: string
          reviewer_id: string
          reviewed_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          order_id: string
          reviewer_id: string
          reviewed_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          order_id?: string
          reviewer_id?: string
          reviewed_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          created_at?: string
        }
      }
      telegram_sync: {
        Row: {
          id: string
          user_id: string
          telegram_chat_id: number
          webapp_chat_id: string
          last_sync_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          telegram_chat_id: number
          webapp_chat_id: string
          last_sync_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          telegram_chat_id?: number
          webapp_chat_id?: string
          last_sync_at?: string
          created_at?: string
        }
      }
    }
  }
}
