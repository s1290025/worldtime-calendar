-- events テーブルを修正するSQL
-- calendar_id カラムを追加

-- まず、events テーブルの現在の構造を確認するために既存のカラムを保持
-- 足りないカラムを追加

-- calendar_id カラムがない場合に追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'calendar_id') THEN
        ALTER TABLE events ADD COLUMN calendar_id UUID REFERENCES shared_calendars(id) ON DELETE CASCADE;
    END IF;
END $$;

-- participant_id カラムがない場合に追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'participant_id') THEN
        ALTER TABLE events ADD COLUMN participant_id UUID REFERENCES participants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- timezone カラムがない場合に追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'timezone') THEN
        ALTER TABLE events ADD COLUMN timezone TEXT;
    END IF;
END $$;

-- all_day カラムがない場合に追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'all_day') THEN
        ALTER TABLE events ADD COLUMN all_day BOOLEAN DEFAULT false;
    END IF;
END $$;

-- color カラムがない場合に追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'color') THEN
        ALTER TABLE events ADD COLUMN color TEXT;
    END IF;
END $$;

-- updated_at カラムがない場合に追加
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'updated_at') THEN
        ALTER TABLE events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- インデックスを追加（既にある場合はスキップ）
CREATE INDEX IF NOT EXISTS idx_events_calendar_id ON events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_participant_id ON events(participant_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);

