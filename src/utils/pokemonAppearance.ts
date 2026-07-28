import { PokemonModel } from '@/model/pokemon';

// カードの見た目(日本語名・タイプ・画像の中身)を表すキー。これが同じポケモンは重複表示とみなす。
// 画像はURLではなく内容ハッシュで比較する。メテノの隕石フォルムのように
// 「URLは別だが中身は同一の画像」があるため。色違いのコアやシャリタツの3フォルムなど、
// 画像の中身が異なるフォルムは別カードとして残る
export const appearanceKey = (pokemon: PokemonModel) =>
  [pokemon.japaneseName, pokemon.japaneseTypes.join('/'), pokemon.imageHash ?? pokemon.image].join('|');

// 見た目がまったく同じポケモン(画像なしフォルム違いなど)を最初の1件に統一する
export const uniqueByAppearance = (pokemons: PokemonModel[]): PokemonModel[] => {
  const seen = new Map<string, PokemonModel>();
  for (const pokemon of pokemons) {
    const key = appearanceKey(pokemon);
    if (!seen.has(key)) {
      seen.set(key, pokemon);
    }
  }
  return Array.from(seen.values());
};
