'use client';
import PokemonThumbnails from '@/components/PokemonThumbnails';
import Search from '@/components/Search';
import { PokemonModel } from '@/model/pokemon';
import { getFromIndexedDB, saveToIndexedDB } from '@/repository/indexDB';
import { PokemonRepo } from '@/repository/pokemon';
import { typeTranslations } from '@/utils/typeTranslations';
import axios from 'axios';
import { getDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // すべてのポケモンデータを格納するステート。アプリ全体で使用される。
  const [allPokemons, setAllPokemons] = useState<PokemonModel[]>([]);
  // ユーザーが選択したポケモンのタイプを管理するステート。フィルター機能に使用。
  const [selectedType, setSelectedType] = useState<string>();
  // ユーザーが入力した検索キーワードを管理するステート。検索機能に使用。
  const [searchInput, setSearchInput] = useState('');
  // フィルタリングされたポケモンデータを格納するステート。表示するデータを管理。
  const [filterPokemons, setFilterPokemons] = useState<PokemonModel[]>();

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
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPokemonObject = async (results: []) => {
    const pokemonPromises = results.map(async (pokemon: PokemonModel) => {
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
                description: japaneseFlavorText || 'Description not available', // 日本語の説明文
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

  const onSearch = async () => {
    const filterPokemonList = await PokemonRepo.pokemonFilterQuery(searchInput, selectedType);
    setFilterPokemons(filterPokemonList);
  };

  const onReset = async () => {
    setFilterPokemons(undefined);
    setSearchInput('');
    setSelectedType('');
  };

  if (allPokemons.length === 0) return;

  return (
    <>
      <Search selectedType={selectedType} setSelectedType={setSelectedType} onSearch={onSearch} onReset={onReset} />
      <div className="app-container">
        <div className="pokemon-container">
          <div className="all-container">
            {!filterPokemons ? (
              <>
                {allPokemons.map((pokemon) => (
                  <Link key={pokemon.id} href={`/detail?name=${pokemon.name}`}>
                    <PokemonThumbnails
                      id={pokemon.id}
                      name={pokemon.japaneseName}
                      image={pokemon.image}
                      iconImage={pokemon.iconImage}
                      japaneseTypes={pokemon.japaneseTypes}
                      types={pokemon.types}
                    />
                  </Link>
                ))}
              </>
            ) : (
              filterPokemons.map((pokemon) => (
                <Link key={pokemon.id} href={`/detail?name=${pokemon.name}`}>
                  <PokemonThumbnails
                    id={pokemon.id}
                    name={pokemon.japaneseName}
                    image={pokemon.image}
                    iconImage={pokemon.iconImage}
                    japaneseTypes={pokemon.japaneseTypes}
                    types={pokemon.types}
                  />
                </Link>
              ))
            )}
          </div>
          {!filterPokemons &&
            (isLoading ? (
              <div className="load-more">読み込み中...</div>
            ) : (
              <button className="load-more" onClick={getAllPokemons}>
                もっとみる！
              </button>
            ))}
        </div>
      </div>
    </>
  );
}
