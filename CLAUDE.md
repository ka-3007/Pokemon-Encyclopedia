# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

PokeAPI のデータを日本語表示するポケモン図鑑 Web アプリ。Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS。データは PokeAPI → Firestore → 各層キャッシュという流れで配信される。コードコメント・コミットメッセージは日本語。

## コマンド

```bash
npm run dev      # 開発サーバー (http://localhost:3000)
npm run build    # 本番ビルド
npm run lint     # ESLint (next lint)
```

- Firebase は Firestore / Analytics のみ利用（Hosting へのデプロイはしていない）。

- テストは存在しない。
- Firebase 接続に `.env.local` が必要（`NEXT_PUBLIC_FIREBASE_*` 7変数、README 参照）。

## アーキテクチャ

### 3層キャッシュとデータフロー（最重要）

1. **Firestore（永続ストア）**: `pokemons` コレクションに1匹1ドキュメント。`src/lib/pokemonServer.ts` の `getOrSeedPokemon` が「Firestore にあればそれを返し、なければ PokeAPI から取得して `src/services/fetchPokemonData.ts` で整形・保存」を行う（シードはサーバーサイドのみ）。
2. **サーバーキャッシュ**: `getPokemonPage` / `getPokemonDetail` は `unstable_cache` で1日キャッシュ。Firestore 読み取りがユーザー数に比例しない設計。
3. **クライアントキャッシュ**: TanStack Query + IndexedDB 永続化（`src/app/provider.tsx`, `src/lib/queryPersister.ts`）。staleTime/gcTime も1日。

### キャッシュ無効化は `src/config/cache.ts` に一元化

データ形式や取得ロジックを変更したら **`POKEMON_DATA_VERSION` を +1 するだけ**でよい。この数字から以下がすべて連動する:
- Firestore 既存ドキュメントの再取得判定（`dataVersion` フィールド比較）
- `unstable_cache` のキャッシュキー（`pokemon-page-v4` など）
- クライアント永続キャッシュの buster

### 画面ごとのデータ取得経路

- **一覧** (`src/app/page.tsx` → `src/components/HomeClient.tsx`): 初回1ページ（50匹）はサーバーで取得、2ページ目以降は無限スクロールで `/api/pokemons?offset=` (`src/app/api/pokemons/route.ts`) を叩く。
- **検索・タイプ絞り込み** (`src/components/Search.tsx`): サーバーを経由せず、クライアントから Firestore を直接クエリする（`src/repository/pokemon.ts` の `pokemonFilterQuery`）。ひらがな→カタカナ正規化した `japaneseName` の前方一致 + `japaneseTypes` の array-contains。**Firestore にシード済みのポケモンしかヒットしない**点に注意。
- **詳細** (`src/app/detail/[name]/page.tsx`): `getPokemonDetailWithRelated` が本体 + 進化先 + フォーム違いをまとめて取得するサーバーコンポーネント。

### 見た目の重複排除（imageHash）

フォルム違いには「URL は別だが画像の中身が同一」のケースがある（例: メテノの隕石フォルム7色）。そのため `fetchPokemonData` が画像内容の SHA-1 を `imageHash` として保存し、`src/utils/pokemonAppearance.ts` の `appearanceKey`（日本語名 + タイプ + imageHash）で一覧・詳細の両方が重複カードを除外する。表示系を変更するときはこの共通ロジックを経由すること。

### その他の前提

- `fetchPokemonData` は日本語データの欠損に対して多段フォールバックを持つ（説明文: ja → ja-Hrkt → 分類から生成、画像: フォルム違いでスプライトがなければ基本フォルムの画像）。
- 画像は `next/image` で配信し、`next.config.mjs` で raw.githubusercontent.com のみ許可 + 1日キャッシュ。SVG 許可のため CSP を設定している。
- 一覧はスクロール位置を sessionStorage に保存し、詳細から戻ったとき高さの復元を待ってからスクロール復元する（`HomeClient.tsx`）。
