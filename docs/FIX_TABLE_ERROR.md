# テーブル作成エラーの解決方法

## 🔍 状況

- ✅ `events` テーブルは既に存在
- ❓ `shared_calendars` と `participants` は不明
- ⚠️ エラー: "events already exists"

## 🎯 やること

### ステップ 1: テーブルの確認

Supabaseの「Table Editor」で確認：

1. `shared_calendars` テーブルが存在するか？
2. `participants` テーブルが存在するか？
3. `events` テーブルは存在 ✅

### ステップ 2: 不足しているテーブルを追加

もし `shared_calendars` や `participants` がない場合：

**SQL Editorで以下を実行：**

```sql
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

-- インデックス
CREATE INDEX IF NOT EXISTS idx_events_calendar_id ON events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_participant_id ON events(participant_id);
CREATE INDEX IF NOT EXISTS idx_participants_calendar_id ON participants(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);

-- RLS 有効化
ALTER TABLE shared_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
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
```

**または、`supabase/add_missing_tables.sql` の内容を実行**

### ステップ 3: 確認

Table Editorで3つのテーブルを確認：

- ✅ `shared_calendars`
- ✅ `participants`  
- ✅ `events`

## 💡 エラーが出た場合

### エラー: "policy already exists"

→ 正常（既にポリシーが存在するだけ）

### エラー: "index already exists"

→ 正常（既にインデックスが存在するだけ）

### エラー: "table already exists"

→ 正常（既にテーブルが存在するだけ）

**`IF NOT EXISTS` があるので、エラーが出ても問題ありません！**

## ✅ 完了条件

Table Editorに以下3つが表示されれば完了：

1. ✅ `shared_calendars`
2. ✅ `participants`
3. ✅ `events`

## 🚀 次のステップ

テーブル準備が完了したら：

1. 環境変数を設定
2. コードをSupabase対応に更新
3. 動作確認

