import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Query,
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  startAt,
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

  async pokemonFilterQuery(name: string, type?: string) {
    const convertHiraganaToKatakana = (str: string) => {
      return str.replace(/[\u3041-\u3096]/g, (ch) => {
        return String.fromCharCode(ch.charCodeAt(0) + 0x60);
      });
    };
    let q: Query<PokemonModel, DocumentData>;
    // 基本のクエリを作成
    q = query(this.pokemonColRef());

    if (name) {
      // ひらがなをカタカナに変換
      const katakanaPrefix = convertHiraganaToKatakana(name);
      // 基本のクエリを作成
      q = query(q, orderBy('japaneseName'), startAt(katakanaPrefix), endAt(katakanaPrefix + '\uf8ff'));
    }

    if (type) {
      q = query(q, where('japaneseTypes', 'array-contains', type));
    }

    if (name || type) {
      const querySnapshot = await getDocs(q);
      const pokemon = querySnapshot.docs.map((doc) => doc.data()).sort((a, b) => a.id - b.id);

      return pokemon;
    }

    return [];
  }

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
