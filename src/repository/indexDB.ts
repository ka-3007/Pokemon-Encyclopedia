import { PokemonModel } from '@/model/pokemon';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// データベースのスキーマを定義
interface PokemonDB extends DBSchema {
  pokemons: {
    key: string;
    value: PokemonModel;
  };
}

// IndexedDBの初期化
let dbPromise: Promise<IDBPDatabase<PokemonDB>> | null = null;
if (typeof window !== 'undefined') {
  dbPromise = openDB<PokemonDB>('pokemon-db', 1, {
    upgrade(db) {
      db.createObjectStore('pokemons');
    },
  });
}

// データをIndexedDBに保存する関数
export const saveToIndexedDB = async (pokemonData: PokemonModel) => {
  if (!dbPromise) return undefined;
  const db = await dbPromise;
  await db.put('pokemons', pokemonData, pokemonData.name);
};

// IndexedDBからデータを取得する関数
export const getFromIndexedDB = async (name: string): Promise<PokemonModel | undefined> => {
  if (!dbPromise) return undefined;
  const db = await dbPromise;
  return db.get('pokemons', name);
};
