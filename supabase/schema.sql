-- ============================================
-- Supabase データベーススキーマ
-- ============================================

-- 共有カレンダーテーブル
CREATE TABLE IF NOT EXISTS shared_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT UNIQUE NOT NULL
);

-- 参加者テーブル
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES shared_calendars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 予定テーブル
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES shared_calendars(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL,
  all_day BOOLEAN DEFAULT false,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_events_calendar_id ON events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_participant_id ON events(participant_id);
CREATE INDEX IF NOT EXISTS idx_participants_calendar_id ON participants(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);

-- RLS (Row Level Security) を有効化
ALTER TABLE shared_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（全員が読み書き可能）
DO $$
BEGIN
  -- shared_calendars ポリシー
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shared_calendars' AND policyname = 'Enable read for all users') THEN
    CREATE POLICY "Enable read for all users" ON shared_calendars FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shared_calendars' AND policyname = 'Enable insert for all users') THEN
    CREATE POLICY "Enable insert for all users" ON shared_calendars FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shared_calendars' AND policyname = 'Enable update for all users') THEN
    CREATE POLICY "Enable update for all users" ON shared_calendars FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shared_calendars' AND policyname = 'Enable delete for all users') THEN
    CREATE POLICY "Enable delete for all users" ON shared_calendars FOR DELETE USING (true);
  END IF;

  -- participants ポリシー
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participants' AND policyname = 'Enable read for all users') THEN
    CREATE POLICY "Enable read for all users" ON participants FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participants' AND policyname = 'Enable insert for all users') THEN
    CREATE POLICY "Enable insert for all users" ON participants FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participants' AND policyname = 'Enable update for all users') THEN
    CREATE POLICY "Enable update for all users" ON participants FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participants' AND policyname = 'Enable delete for all users') THEN
    CREATE POLICY "Enable delete for all users" ON participants FOR DELETE USING (true);
  END IF;

  -- events ポリシー
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable read for all users') THEN
    CREATE POLICY "Enable read for all users" ON events FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable insert for all users') THEN
    CREATE POLICY "Enable insert for all users" ON events FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable update for all users') THEN
    CREATE POLICY "Enable update for all users" ON events FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable delete for all users') THEN
    CREATE POLICY "Enable delete for all users" ON events FOR DELETE USING (true);
  END IF;
END $$;

