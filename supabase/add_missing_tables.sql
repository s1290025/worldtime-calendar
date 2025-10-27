-- 不足しているテーブルを追加するSQL
-- events テーブルは既に存在するため、それ以外を作成

-- 共有カレンダーテーブル（まだない場合）
CREATE TABLE IF NOT EXISTS shared_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT UNIQUE NOT NULL
);

-- 参加者テーブル（まだない場合）
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES shared_calendars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- インデックス（まだない場合）
CREATE INDEX IF NOT EXISTS idx_events_calendar_id ON events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_participant_id ON events(participant_id);
CREATE INDEX IF NOT EXISTS idx_participants_calendar_id ON participants(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);

-- RLS 有効化
ALTER TABLE shared_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（既にある場合はエラー無視）
CREATE POLICY "Enable read for all users" ON shared_calendars FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON shared_calendars FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON shared_calendars FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON shared_calendars FOR DELETE USING (true);

CREATE POLICY "Enable read for all users" ON participants FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON participants FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON participants FOR DELETE USING (true);

CREATE POLICY "Enable read for all users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON events FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON events FOR DELETE USING (true);

