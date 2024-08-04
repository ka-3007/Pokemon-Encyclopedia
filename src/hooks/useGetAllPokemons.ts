import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { allPokemonsState, urlState } from '@/recoil/atom';
import axios from 'axios';
import { createPokemonObject } from '@/services/createPokemonObject';

export const useGetAllPokemons = () => {
  // すべてのポケモンデータを格納するステート。アプリ全体で使用される。
  const setAllPokemons = useSetRecoilState(allPokemonsState);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useRecoilState(urlState);

  const getAllPokemons = async () => {
    setIsLoading(true);
    try {
      if (url) {
        // 指定されたURLからポケモンデータを取得
        const response = await axios.get(url);
        const data = response.data;
        // ポケモンオブジェクトを作成する関数を呼び出し、データの結果を渡す
        const pokemonPromises = await createPokemonObject(data.results);
        // すべてのポケモンのプロミスが解決するのを待ち、その結果を取得
        const newPokemons = (await Promise.all(pokemonPromises)).filter((pokemon) => pokemon !== null);
        // 現在のポケモンリストを更新する
        setAllPokemons((currentList) => [...currentList, ...newPokemons].sort((a, b) => a.id - b.id));
        // 次のページのURLをセット
        setUrl(data.next);
      }
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { getAllPokemons, isLoading };
};
