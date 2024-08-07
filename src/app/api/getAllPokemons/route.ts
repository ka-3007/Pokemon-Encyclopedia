import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import fetchPokemonData from '@/services/fetchPokemonData';
import axios from 'axios';
import { getDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // 指定されたURLからポケモンデータを取得
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=50');
    const data = response.data;

    const pokemonPromises = data.results.map(async (pokemon: PokemonModel) => {
      // Firebaseからポケモンデータを取得しようとする
      const pokemonDoc = await getDoc(PokemonRepo.pokemonDocRef(pokemon.name));

      if (pokemonDoc.exists()) {
        // Firebaseにデータが存在する場合、それを使用する
        const data = pokemonDoc.data() as PokemonModel;

        return data;
      } else {
        const pokemonData = await fetchPokemonData(pokemon.name);

        return pokemonData;
      }
    });

    // すべてのポケモンのプロミスが解決するのを待ち、その結果を取得
    const newPokemons = (await Promise.all(pokemonPromises)).filter((pokemon) => pokemon !== null);
    //ソート
    const allPokemons = newPokemons.sort((a, b) => a.id - b.id);

    return NextResponse.json({ allPokemons, nextUrl: data.next }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
