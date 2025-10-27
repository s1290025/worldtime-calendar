# 🎉 テーブル準備完了！

## ✅ 完了したこと

- ✅ `shared_calendars` テーブル作成
- ✅ `participants` テーブル作成
- ✅ `events` テーブル更新（必要なカラム追加）

## 🚀 次のステップ

### 1. 環境変数を設定（必須）

**`.env.local` に追加：**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**取得方法：**
1. Supabaseダッシュボード → 「Project Settings」→「API」
2. URL と anon public key をコピー
3. `.env.local` に貼り付け

### 2. Vercel の環境変数も設定

1. Vercelダッシュボード → プロジェクトを選択
2. 「Settings」→「Environment Variables」
3. 上記2つを追加

### 3. コード実装（私がやります）

- `utils/share.ts` をSupabase対応に更新
- `utils/events.ts` をSupabase対応に更新
- リアルタイム機能を追加
- 動作確認

### 4. 動作確認

ローカル：
```bash
npm run dev
```

本番：
- Vercelが自動デプロイ
- デプロイURLにアクセスして確認

## 📝 現在の状況

✅ データベース準備完了
⏳ 環境変数設定待ち
⏳ コード実装待ち

## 🎯 今やること

**環境変数を設定してください！**

設定できたら教えてください。コード実装を開始します。

