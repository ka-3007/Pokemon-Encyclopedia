// キャッシュ関連の設定を一括管理するファイル。
//
// ポケモンデータの形式や取得ロジックを変更したら POKEMON_DATA_VERSION を1つ上げるだけでよい。
// この数字から以下がすべて自動的に連動する:
//   - Firestoreの既存ドキュメントの再取得判定 (dataVersionフィールドとの比較)
//   - サーバー側 unstable_cache のキャッシュキー (pokemon-page-v2 など)
//   - クライアント側 TanStack Query 永続キャッシュの buster
export const POKEMON_DATA_VERSION = 4;

// キャッシュキーやbusterに付けるバージョンタグ (例: 'v2')
export const CACHE_VERSION_TAG = `v${POKEMON_DATA_VERSION}`;

// ポケモンデータはほぼ不変なので、サーバー・クライアントとも1日キャッシュする
export const CACHE_TTL_SECONDS = 60 * 60 * 24;
export const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;
