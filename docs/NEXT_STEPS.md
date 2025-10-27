# 🚀 今すぐやるべきこと - 3ステップ

## ステップ 1: Supabaseテーブルを作成（5分）

### 1. Supabaseダッシュボードにアクセス
https://supabase.com/dashboard

### 2. SQL Editorを開く
- 左サイドバーの「SQL Editor」をクリック

### 3. 新しいクエリを作成
- 「New query」をクリック

### 4. SQLを実行
```sql
-- このファイル supabase/schema.sql の内容を
-- コピー＆ペーストして「Run」をクリック
```

または、以下のSQLを直接実行：

```sql
-- 共有カレンダーテーブル
CREATE TABLE shared_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT UNIQUE NOT NULL
);

-- 参加者テーブル
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES shared_calendars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 予定テーブル
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
CREATE INDEX idx_participants_calendar_id ON participants(calendar_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);

-- RLS有効化
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

### 5. 確認
- 「Table Editor」で以下3つのテーブルが作成されていることを確認
  - ✅ `shared_calendars`
  - ✅ `participants`
  - ✅ `events`

---

## ステップ 2: 環境変数を設定（3分）

### ローカル環境

1. プロジェクトルートに `.env.local` ファイルを作成

2. 以下の内容を追加：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **実際の値を取得：**
   - Supabaseダッシュボード → 「Project Settings」→「API」
   - `URL` と `anon public` キーをコピー
   - `.env.local` に貼り付け

### Vercel環境

1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」に移動
4. 以下2つを追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 値はローカルと同じものを使用

---

## ステップ 3: 動作確認（2分）

### ローカルで確認

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

### 本番環境で確認

1. Vercelで環境変数を設定後、再デプロイ
2. デプロイURLにアクセス
3. 動作確認

---

## ✅ 完了！

これで、Supabaseと連携した状態で動作します。

## 📝 注意点

現在のコードは**localStorage**ベースで動作しているため：
- **データはローカルに保存される**
- **ブラウザを閉じると消える（sessionStorageのため）**
- **他のデバイスとは共有されない**

完全な共有機能が必要な場合は、Supabaseに統合するコード更新が必要です（別途実施可能）。

