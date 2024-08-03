import {
  CollectionReference,
  DocumentReference,
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
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

  // // ポケモンリストクエリ関数
  // async pokemonDetailQuery(type: string) {
  //   const q = query(this.pokemonColRef(), where('japaneseTypes', 'array-contains', type), orderBy('id', 'asc'));
  //   const querySnapshot = await getDocs(q);
  //   const pokemon = querySnapshot.docs.map((doc) => doc.data());

  //   return pokemon;
  // }

  async pokemonFilterQuery(name: string, type?: string) {
    const convertHiraganaToKatakana = (str: string) => {
      return str.replace(/[\u3041-\u3096]/g, (ch) => {
        return String.fromCharCode(ch.charCodeAt(0) + 0x60);
      });
    };
    // ひらがなをカタカナに変換
    const katakanaPrefix = convertHiraganaToKatakana(name);
    // 基本のクエリを作成
    let q = query(
      this.pokemonColRef(),
      orderBy('japaneseName'),
      startAt(katakanaPrefix),
      endAt(katakanaPrefix + '\uf8ff'),
    );
    // type が指定されている場合、追加の条件をクエリに追加
    if (type) {
      q = query(q, where('japaneseTypes', 'array-contains', type));
    }
    const querySnapshot = await getDocs(q);
    const pokemon = querySnapshot.docs.map((doc) => doc.data()).sort((a, b) => a.id - b.id);
    console.log(pokemon);

    return pokemon;
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
