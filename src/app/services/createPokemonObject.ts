import { PokemonModel } from '@/model/pokemon';
import { getFromIndexedDB, saveToIndexedDB } from '@/repository/indexDB';
import { PokemonRepo } from '@/repository/pokemon';
import { typeTranslations } from '@/utils/typeTranslations';
import axios from 'axios';
import { getDoc, setDoc } from 'firebase/firestore';
import { processEvolutionChain } from './processEvolutionChain';

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

export const createPokemonObject = async (results: []) => {
  return results.map(async (pokemon: PokemonModel) => {
    try {
      // IndexedDBからポケモンデータを取得しようとする
      const cachedPokemon = await getFromIndexedDB(pokemon.name);
      if (cachedPokemon) {
        // IndexedDBにデータが存在する場合、それを使用する
        return cachedPokemon;
      } else {
        // Firebaseからポケモンデータを取得しようとする
        const pokemonDoc = await getDoc(PokemonRepo.pokemonDocRef(pokemon.name));

        if (pokemonDoc.exists()) {
          // Firebaseにデータが存在する場合、それを使用する
          const data = pokemonDoc.data() as PokemonModel;
          // IndexedDBにデータを保存する
          await saveToIndexedDB(data);
          return data;
        } else {
          // ポケモンAPIからポケモンのデータを取得するためのURLを設定
          const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`;
          // ポケモンデータをAPIから取得
          const response = await axios.get(pokemonUrl);
          const data = response.data;
          // ポケモンの詳細情報（species）のURLが存在する場合
          if (data.species && data.species.url) {
            // 詳細情報を取得するためにAPIリクエストを送信
            const speciesResponse = await axios.get(data.species.url);

            // 日本語の名前を取得
            const japaneseName = speciesResponse.data.names.find(
              (name: NameEntry) => name.language.name === 'ja',
            )?.name;

            // 日本語の説明文を取得
            const japaneseFlavorText = speciesResponse.data.flavor_text_entries.find(
              (entry: FlavorTextEntry) => entry.language.name === 'ja',
            )?.flavor_text;

            // 画像URLを取得するためのカスタム関数を呼び出し
            const _image =
              data.sprites.other['official-artwork'].front_default ||
              data.sprites.other.dream_world.front_default ||
              '/pokemon_ball.svg';
            // アイコン画像URLを取得するためのカスタム関数を呼び出し
            const _iconImage =
              data.sprites.other.dream_world.front_default ||
              data.sprites.other['official-artwork'].front_default ||
              '/pokemon_ball.svg';

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

            // 各フォームの詳細情報から名前を取得
            const formNamesPromises = speciesResponse.data.varieties.map(
              async (variety: { pokemon: { name: string; url: string } }) => {
                const formResponse = await axios.get(variety.pokemon.url);
                const formData = formResponse.data;

                // フォームの名前だけを返す
                return formData.name;
              },
            );

            // すべてのフォーム名を非同期に取得
            const formNames = await Promise.all(formNamesPromises);

            // ポケモンデータのオブジェクトを作成
            const pokemonData: PokemonModel = {
              id: data.id, // ポケモンのID
              name: data.name, // ポケモンの英語名
              japaneseName, // ポケモンの日本語名
              iconImage: _iconImage, // アイコン画像URL
              image: _image, // 画像URL
              types: _types, // タイプの配列
              japaneseTypes: _japaneseTypes, // 日本語のタイプの配列
              height: data.height / 10,
              weight: data.weight / 10,
              description:
                japaneseFlavorText || speciesResponse.data.flavor_text_entries[0].flavor_text || '説明はありません',
              evolutionData: evolutionData,
              formNames: formNames,
            };
            // ポケモンデータをFirebaseに保存
            await setDoc(PokemonRepo.pokemonDocRef(pokemon.name), pokemonData);
            // ポケモンデータをIndexedDBに保存
            await saveToIndexedDB(pokemonData);

            return pokemonData;
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${pokemon.name}:`, error);
    }
    return null;
  });
};
