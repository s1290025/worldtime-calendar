# Supabase + Vercel 実装ガイド

このガイドでは、調整さん風の共有カレンダー機能をSupabaseとVercelで実装するための詳細な手順を説明します。

## 📋 目次

1. [Supabase プロジェクトの作成](#1-supabase-プロジェクトの作成)
2. [データベーススキーマの作成](#2-データベーススキーマの作成)
3. [環境変数の設定](#3-環境変数の設定)
4. [Supabase クライアントの設定](#4-supabase-クライアントの設定)
5. [Vercel へのデプロイ](#5-vercel-へのデプロイ)

## 1. Supabase プロジェクトの作成

### ステップ 1-1: Supabase アカウント作成

1. [Supabase](https://supabase.com/) にアクセス
2. 「Sign in」または「Start your project」をクリック
3. GitHubアカウントでサインイン（推奨）

### ステップ 1-2: 新規プロジェクト作成

1. 「New Project」ボタンをクリック
2. プロジェクト設定：
   - **Name**: `worldtime-calendar`
   - **Database Password**: 強力なパスワードを設定
   - **Region**: `Tokyo (ap-northeast-1)` を選択（日本に近いので高速）
3. 「Create new project」をクリック
4. 数分待つ（データベースのプロビジョニング）

### ステップ 1-3: API認証情報を確認

プロジェクトが作成されたら：

1. 「Project Settings」→「API」に移動
2. 以下の情報をメモ：
   - **URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJ...` (長い文字列)
   - **service_role key**: `eyJ...` (機密情報 - サーバー側でのみ使用)

---

## 2. データベーススキーマの作成

### ステップ 2-1: SQL Editor を開く

1. Supabaseダッシュボードで「SQL Editor」をクリック
2. 「New query」をクリック

### ステップ 2-2: テーブル作成SQLを実行

以下のSQLをコピー＆ペーストして実行：

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

-- インデックス作成
CREATE INDEX idx_events_calendar_id ON events(calendar_id);
CREATE INDEX idx_events_participant_id ON events(participant_id);
CREATE INDEX idx_participants_calendar_id ON participants(calendar_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);

-- RLS (Row Level Security) を有効化
ALTER TABLE shared_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（全員が読み書き可能）
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

### ステップ 2-3: 確認

1. 「Refresh」ボタンをクリック
2. 「Table Editor」で `shared_calendars`, `participants`, `events` テーブルが作成されていることを確認

---

## 3. 環境変数の設定

### ステップ 3-1: `.env.local` ファイルを作成

プロジェクトルートに `.env.local` ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **重要**: `.env.local` は `.gitignore` に追加されているはずです（Gitにコミットしないように）

### ステップ 3-2: 実際の値を設定

1. Supabaseダッシュボードから「Project Settings」→「API」に移動
2. `.env.local` に実際の値をコピー＆ペースト

---

## 4. Supabase クライアントの設定

### ステップ 4-1: Supabase JS ライブラリをインストール

```bash
npm install @supabase/supabase-js
```

### ステップ 4-2: Supabase クライアントを作成

`lib/supabase.ts` を更新：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義
export type SharedCalendar = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  created_by: string;
};

export type Participant = {
  id: string;
  calendar_id: string;
  name: string;
  color: string;
  joined_at: string;
  is_active: boolean;
};

export type Event = {
  id: string;
  calendar_id: string;
  participant_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  all_day: boolean;
  color: string;
  created_at: string;
  updated_at: string;
};
```

---

## 5. Vercel へのデプロイ

### ステップ 5-1: GitHub リポジトリを作成

1. [GitHub](https://github.com) にアクセス
2. 「New repository」をクリック
3. リポジトリ名を入力（例：`worldtime-calendar`）
4. 「Create repository」をクリック

### ステップ 5-2: コードをプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/worldtime-calendar.git
git push -u origin main
```

### ステップ 5-3: Vercel でプロジェクトをインポート

1. [Vercel](https://vercel.com/) にアクセス
2. GitHubアカウントでサインイン
3. 「Add New Project」をクリック
4. 作成したGitHubリポジトリを選択
5. 「Import」をクリック

### ステップ 5-4: 環境変数を設定

1. 「Environment Variables」セクションに移動
2. 以下の環境変数を追加：
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Supabase URL
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Supabase anon key

3. 「Deploy」をクリック
4. 数分待つ（ビルドとデプロイ）

### ステップ 5-5: 確認

1. デプロイが完了したらURLが表示される
2. そのURLにアクセスして動作を確認

---

## 🎉 完了！

これで Supabase + Vercel での実装が完了しました！

### 次のステップ

1. リアルタイム機能の実装
2. 認証システムの追加
3. エラーハンドリングの強化
4. パフォーマンス最適化

