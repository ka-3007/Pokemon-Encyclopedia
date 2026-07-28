import { unstable_cache } from 'next/cache';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';

import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import fetchPokemonData from '@/services/fetchPokemonData';
import { CACHE_TTL_SECONDS, CACHE_VERSION_TAG, POKEMON_DATA_VERSION } from '@/config/cache';

export const PAGE_SIZE = 50;

export type PokemonPage = {
  pokemons: PokemonModel[];
  nextOffset: number | null;
};

// Firestoreから取得し、存在しなければPokeAPIから取得してFirestoreに保存する。
// 古いバージョンの形式で保存されたドキュメントも再取得して上書きする
const getOrSeedPokemon = async (name: string): Promise<PokemonModel | null> => {
  const pokemonDoc = await getDoc(PokemonRepo.pokemonDocRef(name));
  if (pokemonDoc.exists() && pokemonDoc.data().dataVersion === POKEMON_DATA_VERSION) {
    return pokemonDoc.data();
  }
  return fetchPokemonData(name);
};

// ポケモン一覧を1ページ分取得する。unstable_cacheでオフセットごとに1日キャッシュされるため、
// Firestoreへの読み取りはユーザー数に比例しない
export const getPokemonPage = unstable_cache(
  async (offset: number): Promise<PokemonPage> => {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`);
    const data = response.data;

    const pokemons = (
      await Promise.all(
        data.results.map((pokemon: { name: string }) =>
          getOrSeedPokemon(pokemon.name).catch((error) => {
            console.error(`Error fetching data for ${pokemon.name}:`, error);
            return null;
          }),
        ),
      )
    )
      .filter((pokemon): pokemon is PokemonModel => pokemon !== null)
      .sort((a, b) => a.id - b.id);

    return { pokemons, nextOffset: data.next ? offset + PAGE_SIZE : null };
  },
  [`pokemon-page-${CACHE_VERSION_TAG}`],
  { revalidate: CACHE_TTL_SECONDS },
);

// ポケモン1匹の詳細を取得する(名前ごとに1日キャッシュ)
export const getPokemonDetail = unstable_cache(
  async (name: string): Promise<PokemonModel | null> => {
    try {
      return await getOrSeedPokemon(name);
    } catch (error) {
      console.error(`Error fetching detail for ${name}:`, error);
      return null;
    }
  },
  [`pokemon-detail-${CACHE_VERSION_TAG}`],
  { revalidate: CACHE_TTL_SECONDS },
);

// 詳細ページ用に、本体と進化先・フォーム違いの詳細をまとめて取得する
export const getPokemonDetailWithRelated = async (name: string) => {
  const pokemonDetail = await getPokemonDetail(name);

  const newPokemonDetails: Record<string, PokemonModel> = {};
  if (pokemonDetail) {
    const relatedNames = Array.from(
      new Set([
        ...(pokemonDetail.evolutionData?.normalEvolution || []),
        ...(pokemonDetail.evolutionData?.specialEvolution || []),
        ...(pokemonDetail.formNames || []),
      ]),
    ).filter((relatedName) => relatedName !== pokemonDetail.name);

    const relatedPokemonDetails = await Promise.all(
      relatedNames.map(async (relatedName) => ({
        name: relatedName,
        detail: await getPokemonDetail(relatedName),
      })),
    );

    relatedPokemonDetails.forEach(({ name: relatedName, detail }) => {
      if (detail) {
        newPokemonDetails[relatedName] = detail;
      }
    });
  }

  return { pokemonDetail, newPokemonDetails };
};
