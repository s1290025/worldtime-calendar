# ローカル開発環境のセットアップ

このガイドでは、ローカルで開発環境を構築する方法を説明します。

## 📋 前提条件

- Node.js 18以上がインストールされていること
- npm または yarn がインストールされていること
- Supabase アカウント（オプション）

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/worldtime-calendar.git
cd worldtime-calendar
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Supabase のセットアップ（オプション）

Supabaseを使わずに開発する場合は、現在のlocalStorageベースの実装を使用できます。

Supabaseを使う場合：

1. [Supabase](https://supabase.com/) でアカウント作成
2. プロジェクト作成
3. `supabase/schema.sql` を実行してテーブル作成
4. `.env.local` に認証情報を設定

詳細は `docs/SUPABASE_SETUP.md` を参照してください。

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

## 🛠️ 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクション用ビルド
npm run build

# プロダクションサーバー起動
npm start

# Lint実行
npm run lint
```

## 📝 開発のヒント

### ホットリロード

ファイルを編集すると、自動的にブラウザがリロードされます。

### デバッグ

- ブラウザのコンソールでエラーを確認
- React DevToolsをインストール
- ネットワークタブでAPIリクエストを確認

### データのリセット

localStorageを使っている場合、ブラウザのコンソールで実行：

```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

## 🔧 トラブルシューティング

### エラー: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### エラー: "Port 3000 is already in use"

```bash
# 別のポートを使用
npm run dev -- -p 3001
```

### Supabase接続エラー

- `.env.local` ファイルが正しいか確認
- Supabaseダッシュボードでプロジェクトがアクティブか確認
- ネットワーク接続を確認

