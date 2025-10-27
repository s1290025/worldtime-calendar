# デプロイメントガイド

このガイドでは、World Time Calendar をVercelとSupabaseでデプロイする手順を説明します。

## 📋 前提条件

- GitHub アカウント
- Supabase アカウント
- Vercel アカウント
- Node.js 18以上

## 🚀 手順

### 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com/) にアクセスしてサインイン
2. 「New Project」をクリック
3. 以下の設定でプロジェクトを作成：
   - **Name**: `worldtime-calendar`
   - **Database Password**: 強力なパスワードを設定
   - **Region**: `Tokyo (ap-northeast-1)`
4. プロジェクトが作成されるまで数分待つ

### 2. データベーススキーマの作成

1. Supabaseダッシュボードで「SQL Editor」をクリック
2. 「New query」をクリック
3. `supabase/schema.sql` の内容をコピー＆ペースト
4. 「Run」をクリックして実行
5. 「Table Editor」でテーブルが作成されていることを確認

### 3. 環境変数の設定

#### ローカル環境

1. プロジェクトルートに `.env.local` を作成：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Supabaseダッシュボードの「Project Settings」→「API」から値をコピーして設定

#### Vercel環境

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」に移動
3. 以下の環境変数を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Supabase クライアントの設定

`lib/supabase.ts` を更新：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 5. GitHub リポジトリの作成

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/worldtime-calendar.git
git push -u origin main
```

### 6. Vercel へのデプロイ

1. [Vercel](https://vercel.com/) にアクセスしてサインイン
2. 「Add New Project」をクリック
3. GitHubリポジトリをインポート
4. 環境変数を設定
5. 「Deploy」をクリック
6. 数分待ってデプロイ完了

### 7. 動作確認

1. デプロイされたURLにアクセス
2. カレンダー作成機能をテスト
3. 共有URLで参加機能をテスト
4. 予定追加機能をテスト

## 🔧 トラブルシューティング

### エラー: "Environment variable not found"

- `.env.local` ファイルが正しく設定されているか確認
- Vercelの環境変数が正しく設定されているか確認
- 変数名が `NEXT_PUBLIC_` で始まっているか確認

### エラー: "Access denied"

- SupabaseのRLSポリシーを確認
- anon keyが正しく設定されているか確認

### データが表示されない

- Supabaseのテーブルにデータが保存されているか確認
- ブラウザのコンソールでエラーを確認

## 📚 次のステップ

- [ ] リアルタイム機能の実装
- [ ] 認証システムの追加
- [ ] エラーハンドリングの強化
- [ ] パフォーマンス最適化
- [ ] モバイル対応の改善

