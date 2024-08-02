import { DocumentReference, doc } from 'firebase/firestore';

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
}

export const PokemonRepo = PokemonRepository.getInstance();
