import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
export type SharedCalendar = {
  id: string
  name: string
  url: string
  created_at: string
  created_by: string
}

export type Participant = {
  id: string
  calendar_id: string
  name: string
  color: string
  joined_at: string
  is_active: boolean
}

// Supabaseのeventsテーブルの実際の構造に合わせた型定義
export type Event = {
  id: string
  title: string
  date: string
  country?: string
  time?: string
  created_at: string
  calendar_id?: string
  participant_id?: string
  timezone?: string
  all_day?: boolean
  color?: string
  updated_at?: string
  start_time?: string  // 追加されたカラム
  end_time?: string    // 追加されたカラム
  description?: string  // 追加されたカラム
}