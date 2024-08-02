'use client';
import PokemonThumbnails from '@/components/PokemonThumbnails';
import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import { typeTranslations } from '@/utils/typeTranslations';
import axios from 'axios';
import { getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

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

// 公式アートワーク
// ドリームワールドアイコン（オリジナル）
// ホーム版アイコン
// デフォルトの前面スプライト
// 世代VIII以降のアイコン
const getImage = (data: any) => {
  if (data.sprites.other['official-artwork'].front_default) {
    return data.sprites.other['official-artwork'].front_default;
  } else if (data.sprites.other.dream_world.front_default) {
    return data.sprites.other.dream_world.front_default;
  } else if (data.sprites.other.home.front_default) {
    return data.sprites.other.home.front_default;
  } else if (data.sprites.front_default) {
    return data.sprites.front_default;
  } else if (data.sprites.other['official-artwork'].front_shiny) {
    // 色違いの公式アートワーク（通常のアートワークがない場合のフォールバック）
    return data.sprites.other['official-artwork'].front_shiny;
  } else {
    // すべてのオプションが利用できない場合のデフォルト画像
    return '/pokemon_ball.svg';
  }
};

// ドリームワールドアイコン（オリジナル）
// 公式アートワーク
// ホーム版アイコン
// デフォルトの前面スプライト
// 世代VIII以降のアイコン
const getIconImage = (data: any) => {
  if (data.sprites.other.dream_world.front_default) {
    return data.sprites.other.dream_world.front_default;
  } else if (data.sprites.other['official-artwork'].front_default) {
    return data.sprites.other['official-artwork'].front_default;
  } else if (data.sprites.other.home.front_default) {
    return data.sprites.other.home.front_default;
  } else if (data.sprites.front_default) {
    return data.sprites.front_default;
  } else if (data.sprites.other['official-artwork'].front_shiny) {
    // 色違いの公式アートワーク（通常のアートワークがない場合のフォールバック）
    return data.sprites.other['official-artwork'].front_shiny;
  } else {
    // すべてのオプションが利用できない場合のデフォルト画像
    return '/pokemon_ball.svg';
  }
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [allPokemons, setAllPokemons] = useState<PokemonModel[]>([]);

  // APIからデータを取得する
  // パラメータにlimitを設定し、20件取得する
  const [url, setUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=50');

  const getAllPokemons = async () => {
    setIsLoading(true);
    try {
      if (url) {
        // 指定されたURLからポケモンデータを取得
        const response = await axios.get(url);
        const data = response.data;
        // ポケモンオブジェクトを作成する関数を呼び出し、データの結果を渡す
        await createPokemonObject(data.results);
        // 次のページのURLをセット
        setUrl(data.next);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createPokemonObject = async (results: []) => {
    const pokemonPromises = results.map(async (pokemon: PokemonModel) => {
      try {
        // Firebaseからポケモンデータを取得しようとする
        const pokemonDoc = await getDoc(PokemonRepo.pokemonDocRef(pokemon.name));

        if (pokemonDoc.exists()) {
          // Firebaseにデータが存在する場合、それを使用する
          return pokemonDoc.data();
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
            const _image = getImage(data);
            // アイコン画像URLを取得するためのカスタム関数を呼び出し
            const _iconImage = getIconImage(data);
            // ポケモンのタイプを配列として取得
            const _types = data.types.map((typeInfo: { type: { name: string } }) => typeInfo.type.name);
            // タイプの日本語翻訳を取得
            const _japaneseTypes = _types.map((type: string) => typeTranslations[type] || type);
            // ポケモンデータのオブジェクトを作成
            const pokemonData: PokemonModel = {
              id: data.id, // ポケモンのID
              name: data.name, // ポケモンの英語名
              japaneseName, // ポケモンの日本語名
              iconImage: _iconImage, // アイコン画像URL
              image: _image, // 画像URL
              types: _types, // タイプの配列
              japaneseTypes: _japaneseTypes, // 日本語のタイプの配列
              description: japaneseFlavorText || 'Description not available', // 日本語の説明文
            };
            // ポケモンデータをFirebaseに保存
            await setDoc(PokemonRepo.pokemonDocRef(pokemon.name), pokemonData);

            return pokemonData;
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${pokemon.name}:`, error);
      }
      return null;
    });

    try {
      // すべてのポケモンのプロミスが解決するのを待ち、その結果を取得
      const newPokemons = (await Promise.all(pokemonPromises)).filter((pokemon) => pokemon !== null);
      // 現在のポケモンリストを更新する
      setAllPokemons((currentList) => [...currentList, ...newPokemons].sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error('Error processing pokemon promises:', error);
    }
  };

  useEffect(() => {
    getAllPokemons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      <h1>ポケモン図鑑</h1>
      <div className="pokemon-container">
        <div className="all-container">
          {allPokemons.map((pokemon, index) => (
            <PokemonThumbnails
              id={pokemon.id}
              name={pokemon.japaneseName}
              image={pokemon.image}
              iconImage={pokemon.iconImage}
              japaneseTypes={pokemon.japaneseTypes}
              description={pokemon.description}
              types={pokemon.types}
              key={index}
            />
          ))}
        </div>
        {isLoading ? (
          <div className="load-more">now loading...</div>
        ) : (
          <button className="load-more" onClick={getAllPokemons}>
            もっとみる！
          </button>
        )}
      </div>
    </div>
  );
}
