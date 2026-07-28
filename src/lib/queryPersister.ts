import { openDB, IDBPDatabase } from 'idb';
import { AsyncStorage } from '@tanstack/query-persist-client-core';

// React Queryのキャッシュ永続化先としてIndexedDBを使うためのストレージアダプター。
// localStorageと違い容量制限(約5MB)を気にせずポケモン全件をキャッシュできる。
let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB('pokemon-query-cache', 1, {
      upgrade(db) {
        db.createObjectStore('cache');
      },
    });
  }
  return dbPromise;
};

export const idbStorage: AsyncStorage<string> = {
  getItem: async (key) => {
    const db = await getDB();
    if (!db) return null;
    return (await db.get('cache', key)) ?? null;
  },
  setItem: async (key, value) => {
    const db = await getDB();
    if (!db) return;
    await db.put('cache', value, key);
  },
  removeItem: async (key) => {
    const db = await getDB();
    if (!db) return;
    await db.delete('cache', key);
  },
};
