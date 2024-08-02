import {
  CollectionReference,
  DocumentReference,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { PokemonModel } from '@/model/pokemon';

class PokemonRepository {
  private static instance: PokemonRepository;
  static getInstance() {
    if (!PokemonRepository.instance) {
      PokemonRepository.instance = new PokemonRepository();
    }
    return PokemonRepository.instance;
  }

  pokemonDocRef(pokemonName: string) {
    return doc(db, 'pokemons', pokemonName) as DocumentReference<PokemonModel>;
  }

  pokemonColRef() {
    return collection(db, 'pokemons') as CollectionReference<PokemonModel>;
  }

  // // ポケモンリストクエリ関数
  // async pokemonDetailQuery(id: number) {
  //   const q = query(this.pokemonColRef(), where('id', '==', id), limit(1));
  //   const querySnapshot = await getDocs(q);
  //   const pokemon = querySnapshot.docs.map((doc) => doc.data());

  //   return pokemon;
  // }

  async getPokemonDetail(name: string) {
    // Firebaseからポケモンデータを取得しようとする
    const pokemonDoc = await getDoc(PokemonRepo.pokemonDocRef(name));
    if (pokemonDoc.exists()) {
      // Firebaseにデータが存在する場合、それを使用する
      const data = pokemonDoc.data() as PokemonModel;
      return data;
    }
  }
}

export const PokemonRepo = PokemonRepository.getInstance();
