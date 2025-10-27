# World Time Calendar

調整さん風の共有カレンダーアプリ。複数タイムゾーン対応の日時調整が可能です。

## ✨ 機能

- 🌍 複数タイムゾーン対応のカレンダー
- 👥 共有カレンダー機能（URLで参加）
- 🎨 ユーザー別の色分け
- 📅 日/週/月表示
- 📝 予定の追加・編集・削除
- 🔍 時差を考慮した時間表示

## 🚀 デプロイ

このアプリをVercelとSupabaseでデプロイする方法：

### 1. Supabase プロジェクトの作成

詳細は `docs/SUPABASE_SETUP.md` を参照してください。

### 2. 環境変数の設定

`.env.local` ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Vercel へのデプロイ

詳細は `docs/DEPLOYMENT.md` を参照してください。

## 🛠️ 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プロダクション起動
npm start
```

## 📚 ドキュメント

- [Supabase セットアップガイド](docs/SUPABASE_SETUP.md)
- [デプロイメントガイド](docs/DEPLOYMENT.md)

## 🎯 使用技術

- **Next.js 15** - React フレームワーク
- **Supabase** - バックエンド（データベース）
- **Vercel** - デプロイメント
- **Tailwind CSS** - スタイリング
- **dayjs** - 日付操作
- **moment-timezone** - タイムゾーン処理
