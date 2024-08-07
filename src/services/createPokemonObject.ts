import { PokemonModel } from '@/model/pokemon';
import { getFromIndexedDB, saveToIndexedDB } from '@/repository/indexDB';
import { PokemonRepo } from '@/repository/pokemon';
import { typeTranslations } from '@/utils/typeTranslations';
import axios from 'axios';
import { getDoc, setDoc } from 'firebase/firestore';
import { processEvolutionChain } from './processEvolutionChain';
import fetchPokemonData from './fetchPokemonData';

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
          const pokemonData = await fetchPokemonData(pokemon.name);

          return pokemonData;
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${pokemon.name}:`, error);
      return null;
    }
  });
};
