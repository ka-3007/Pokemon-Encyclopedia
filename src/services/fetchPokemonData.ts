import { PokemonModel } from '@/model/pokemon';
import { POKEMON_DATA_VERSION } from '@/config/cache';
import axios from 'axios';
import { processEvolutionChain } from './processEvolutionChain';
import { setDoc } from 'firebase/firestore';
import { PokemonRepo } from '@/repository/pokemon';
import { typeTranslations } from '@/utils/typeTranslations';

interface NameEntry {
  language: {
    name: string;
  };
  name: string;
}

interface FlavorTextEntry {
  language: {
    name: string;
  };
  flavor_text: string;
}

interface GenusEntry {
  language: {
    name: string;
  };
  genus: string;
}

interface SpriteSet {
  front_default: string | null;
  other?: {
    'official-artwork'?: { front_default: string | null };
    dream_world?: { front_default: string | null };
    home?: { front_default: string | null };
  };
}

// 大きい画像用: 公式アートワーク優先
const pickImage = (sprites: SpriteSet): string | null =>
  sprites.other?.['official-artwork']?.front_default ||
  sprites.other?.dream_world?.front_default ||
  sprites.other?.home?.front_default ||
  sprites.front_default ||
  null;

// アイコン用: dream_world優先
const pickIconImage = (sprites: SpriteSet): string | null =>
  sprites.other?.dream_world?.front_default ||
  sprites.other?.['official-artwork']?.front_default ||
  sprites.other?.home?.front_default ||
  sprites.front_default ||
  null;

const fetchPokemonData = async (pokemonName: string) => {
  // ポケモンAPIからポケモンのデータを取得するためのURLを設定
  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
  // ポケモンデータをAPIから取得
  const response = await axios.get(pokemonUrl);
  const data = response.data;
  // ポケモンの詳細情報（species）のURLが存在する場合
  if (data.species && data.species.url) {
    // 詳細情報を取得するためにAPIリクエストを送信
    const speciesResponse = await axios.get(data.species.url);

    // 日本語の名前を取得
    const japaneseName = speciesResponse.data.names.find((name: NameEntry) => name.language.name === 'ja')?.name;

    // 日本語の説明文を取得。漢字版(ja)がなければ、かな版(ja-Hrkt)にフォールバック
    const findFlavorText = (lang: string) =>
      speciesResponse.data.flavor_text_entries.find(
        (entry: FlavorTextEntry) => entry.language.name.toLowerCase() === lang,
      )?.flavor_text;
    const japaneseFlavorText = findFlavorText('ja') || findFlavorText('ja-hrkt');

    // 日本語の分類(例:「パラドックスポケモン」)。第9世代など図鑑説明の日本語が
    // PokeAPIに未登録の種でも、分類は日本語で提供されている
    const japaneseGenus = speciesResponse.data.genera.find((entry: GenusEntry) =>
      entry.language.name.toLowerCase().startsWith('ja'),
    )?.genus;

    // 画像を取得。フォルム違い(ID 10000番台の一部)はスプライトが一切ないことがあるため、
    // その場合は同じ種の基本フォルムの画像にフォールバックする
    let _image = pickImage(data.sprites);
    let _iconImage = pickIconImage(data.sprites);
    if (!_image || !_iconImage) {
      const defaultVariety = speciesResponse.data.varieties.find(
        (variety: { is_default: boolean; pokemon: { name: string; url: string } }) =>
          variety.is_default && variety.pokemon.name !== data.name,
      );
      if (defaultVariety) {
        const defaultResponse = await axios.get(defaultVariety.pokemon.url);
        _image = _image || pickImage(defaultResponse.data.sprites);
        _iconImage = _iconImage || pickIconImage(defaultResponse.data.sprites);
      }
    }
    _image = _image || '/pokemon_ball.svg';
    _iconImage = _iconImage || '/pokemon_ball.svg';

    // ポケモンのタイプを配列として取得
    const _types = data.types.map((typeInfo: { type: { name: string } }) => typeInfo.type.name);
    // タイプの日本語翻訳を取得
    const _japaneseTypes = _types.map((type: string) => typeTranslations[type] || type);

    // ポケモンの種データから進化チェーンのURLを取得
    const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
    // 進化チェーンのURLを使って進化チェーンデータを取得
    const evolutionResponse = await axios.get(evolutionChainUrl);
    // 進化チェーンのデータから進化チェーンのルートを取得
    const evolutionChain = evolutionResponse.data.chain;
    // 進化チェーンを処理する関数を呼び出して、進化データを取得
    const evolutionData = processEvolutionChain(evolutionChain);

    // フォーム名はvarietiesに含まれているため、そのまま取り出す
    const formNames = speciesResponse.data.varieties.map(
      (variety: { pokemon: { name: string } }) => variety.pokemon.name,
    );

    // 日本語の図鑑説明がPokeAPIに存在しない場合は、英語文の代わりに
    // 日本語で取得できる分類情報から説明を組み立てる
    const fallbackDescription = japaneseGenus
      ? `「${japaneseGenus}」に分類されるポケモン。日本語の図鑑説明はまだ提供されていません。`
      : '日本語の図鑑説明はまだ提供されていません。';

    // ポケモンデータのオブジェクトを作成
    const pokemonData: PokemonModel = {
      dataVersion: POKEMON_DATA_VERSION,
      id: data.id, // ポケモンのID
      name: data.name, // ポケモンの英語名
      japaneseName, // ポケモンの日本語名
      iconImage: _iconImage, // アイコン画像URL
      image: _image, // 画像URL
      types: _types, // タイプの配列
      japaneseTypes: _japaneseTypes, // 日本語のタイプの配列
      height: data.height / 10,
      weight: data.weight / 10,
      description: japaneseFlavorText || fallbackDescription,
      evolutionData: evolutionData,
      formNames: formNames,
    };
    // ポケモンデータをFirebaseに保存(サーバーサイドからのみ呼ばれる)
    await setDoc(PokemonRepo.pokemonDocRef(pokemonName), pokemonData);

    return pokemonData;
  }
  return null;
};

export default fetchPokemonData;
