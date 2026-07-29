# ポケモン図鑑（pokemon-encyclopedia）

[PokeAPI](https://pokeapi.co/) のデータを使った、日本語表示のポケモン図鑑 Web アプリです。一覧の閲覧・検索・タイプ絞り込み、詳細画面（進化など）を提供します。

## 機能

- **一覧**: スクロールに応じた追加読み込み（無限スクロール）
- **検索・フィルタ**: 名前（ひらがなはカタカナに正規化）とタイプで絞り込み
- **詳細**: 個体ごとの情報（日本語名・図鑑テキスト・タイプ・進化チェーンなど）
- **データ**: PokeAPI から取得し、Firebase Firestore に保存。サーバー側は `unstable_cache`、クライアント側は TanStack Query + IndexedDB 永続化で1日キャッシュ

## 技術スタック

| 区分             | 使用技術                                       |
| ---------------- | ---------------------------------------------- |
| フレームワーク   | Next.js 14（App Router）、React 18、TypeScript |
| スタイル         | Tailwind CSS                                   |
| データ取得・状態 | TanStack Query（IndexedDB への永続化つき）     |
| HTTP             | Axios                                          |
| BaaS             | Firebase（Firestore、Analytics）               |
| 外部 API         | PokeAPI                                        |

## 前提条件

- [Node.js](https://nodejs.org/) 24.x
- npm（同梱）

## セットアップ

```bash
git clone <リポジトリURL>
cd pokemon-encyclopedia
npm install
```

## 環境変数

Firebase を利用するため、プロジェクトルートに `.env.local` を作成し、次の変数を設定してください（値は Firebase コンソールのプロジェクト設定から取得します）。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## 開発サーバー

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ビルド・本番起動

```bash
npm run build
npm start
```

## ライセンス・クレジット

- ポケモンおよび関連名称・画像の権利は各権利者に帰属します。
- データ取得元: [PokeAPI](https://pokeapi.co/)
