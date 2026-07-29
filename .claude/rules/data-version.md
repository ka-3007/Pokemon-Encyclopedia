# データバージョン更新ルール

`PokemonModel` の形式（フィールドの追加・削除・意味変更）や PokeAPI からの取得・整形ロジック（`src/services/fetchPokemonData.ts` など）を変更したときは、**必ず `src/config/cache.ts` の `POKEMON_DATA_VERSION` を +1 する**こと。

- これを忘れると、Firestore の旧形式ドキュメント・サーバーキャッシュ・クライアントの IndexedDB キャッシュが古いまま残り、新旧データが混在する。
- 逆に、表示だけの変更（コンポーネントやスタイルの修正）ではバージョンを上げない。不要な全データ再取得が発生するため。
