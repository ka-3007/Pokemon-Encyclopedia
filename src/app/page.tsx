'use client';
import PokemonThumbnails from '@/components/PokemonThumbnails';
import axios from 'axios';
import { useEffect, useState } from 'react';

export type Pokemon = {
  id: number;
  name: string;
  image: string;
  iconImage: string;
  type: string;
  types: string[];
  japaneseTypes: string[];
  description: string;
};

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
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);

  // APIからデータを取得する
  // パラメータにlimitを設定し、20件取得する
  const [url, setUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=500');

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
    const pokemonPromises = results.map(async (pokemon: Pokemon) => {
      try {
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`;
        const response = await axios.get(pokemonUrl);
        const data = response.data;

        if (data.species && data.species.url) {
          const speciesResponse = await axios.get(data.species.url);
          const japaneseName = speciesResponse.data.names.find((name: NameEntry) => name.language.name === 'ja')?.name;
          const japaneseFlavorText = speciesResponse.data.flavor_text_entries.find(
            (entry: FlavorTextEntry) => entry.language.name === 'ja',
          )?.flavor_text;

          const _image = data.sprites.other['official-artwork'].front_default;
          const _iconImage = data.sprites.other.dream_world.front_default;
          const _type = data.types[0].type.name;
          // 複数のtypeを配列として取得
          const _types = data.types.map((typeInfo: { type: { name: string } }) => typeInfo.type.name);
          const _japaneseTypes = _types.map((type: string) => typeTranslations[type] || type);

          return {
            id: data.id,
            name: japaneseName || data.name,
            iconImage: _iconImage,
            image: _image,
            type: _type,
            types: _types,
            japaneseTypes: _japaneseTypes,
            description: japaneseFlavorText || 'Description not available',
          };
        }
      } catch (error) {
        console.error(`Error fetching data for ${pokemon.name}:`, error);
      }
      return null;
    });

    const newPokemons = (await Promise.all(pokemonPromises)).filter((pokemon) => pokemon !== null);
    setAllPokemons((currentList) => [...currentList, ...newPokemons].sort((a, b) => a.id - b.id));
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
              type={pokemon.type}
              japaneseTypes={pokemon.japaneseTypes}
              description={pokemon.description}
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
