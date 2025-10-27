-- 最後の必要なカラムを追加

-- start_time カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- description カラムを追加（オプション）
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;

