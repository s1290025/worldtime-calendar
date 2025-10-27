# カラムエラーの解決方法

## 🔍 状況

`events` テーブルは存在するが、必要なカラムが不足している可能性があります。

## 🎯 解決方法

### オプション 1: 簡易確認（推奨）

**SupabaseのTable Editorで `events` テーブルを確認：**

以下が出ればOK:
- ✅ `calendar_id` 
- ✅ `participant_id`
- ✅ `timezone`
- ✅ `all_day`
- ✅ `color`

**もし不足していれば、オプション2を実行**

### オプション 2: カラムを追加（データは保持）

**SQL Editorで実行：**

```sql
-- calendar_id カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS calendar_id UUID;

-- participant_id カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS participant_id UUID;

-- timezone カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone TEXT;

-- all_day カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT false;

-- color カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS color TEXT;

-- updated_at カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### オプション 3: events テーブルを再作成（データは消える）

⚠️ **既存データが消える可能性があるので注意！**

```sql
-- 既存の events テーブルを削除
DROP TABLE IF EXISTS events CASCADE;

-- events テーブルを再作成
CREATE TABLE events (
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

-- インデックス
CREATE INDEX idx_events_calendar_id ON events(calendar_id);
CREATE INDEX idx_events_participant_id ON events(participant_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);
```

## 💡 推奨順序

1. **まず `supabase/fix_events_table.sql` を実行**
2. エラーが出たら既存テーブル構造を確認
3. 必要に応じてオプション3を実行

## ✅ 確認方法

SQL Editorで実行：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events';
```

`calendar_id` が表示されればOK！

