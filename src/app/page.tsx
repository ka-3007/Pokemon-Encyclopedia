'use client';
import PokemonThumbnails from '@/components/PokemonThumbnails';
import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
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

// タイプの英語名と日本語名のマッピング
const typeTranslations: { [key: string]: string } = {
  normal: 'ノーマル',
  fire: 'ほのお',
  water: 'みず',
  electric: 'でんき',
  grass: 'くさ',
  ice: 'こおり',
  fighting: 'かくとう',
  poison: 'どく',
  ground: 'じめん',
  flying: 'ひこう',
  psychic: 'エスパー',
  bug: 'むし',
  rock: 'いわ',
  ghost: 'ゴースト',
  dragon: 'ドラゴン',
  dark: 'あく',
  steel: 'はがね',
  fairy: 'フェアリー',
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
      const response = await axios.get(url);
      const data = response.data;
      await createPokemonObject(data.results);
      // 次の20件をURLにセットする
      setUrl(data.next);
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
          const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`;
          const response = await axios.get(pokemonUrl);
          const data = response.data;

          if (data.species && data.species.url) {
            const speciesResponse = await axios.get(data.species.url);
            const japaneseName = speciesResponse.data.names.find(
              (name: NameEntry) => name.language.name === 'ja',
            )?.name;
            const japaneseFlavorText = speciesResponse.data.flavor_text_entries.find(
              (entry: FlavorTextEntry) => entry.language.name === 'ja',
            )?.flavor_text;

            const _image = data.sprites.other['official-artwork'].front_default;
            const _iconImage = data.sprites.other.dream_world.front_default;
            // 複数のtypeを配列として取得
            const _types = data.types.map((typeInfo: { type: { name: string } }) => typeInfo.type.name);
            const _japaneseTypes = _types.map((type: string) => typeTranslations[type] || type);

            const pokemonData: PokemonModel = {
              id: data.id,
              name: japaneseName || data.name,
              iconImage: _iconImage,
              image: _image,
              types: _types,
              japaneseTypes: _japaneseTypes,
              description: japaneseFlavorText || 'Description not available',
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
      const newPokemons = (await Promise.all(pokemonPromises)).filter((pokemon) => pokemon !== null);
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
              name={pokemon.name}
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
