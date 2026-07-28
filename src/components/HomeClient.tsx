'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import PokemonThumbnails from '@/components/PokemonThumbnails';
import Search from '@/components/Search';
import { PokemonPage } from '@/lib/pokemonServer';
import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import { uniqueByAppearance } from '@/utils/pokemonAppearance';

export default function HomeClient({ initialPage }: { initialPage: PokemonPage }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['pokemons'],
    queryFn: async ({ pageParam }) => {
      const response = await axios.get<PokemonPage>(`/api/pokemons?offset=${pageParam}`);
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    initialData: { pages: [initialPage], pageParams: [0] },
  });

  // 取得済みの全ページをフラットな一覧にする
  const allPokemons = useMemo(() => data.pages.flatMap((page) => page.pokemons), [data]);

  // ユーザーが選択したポケモンのタイプを管理するステート。フィルター機能に使用。
  const [selectedType, setSelectedType] = useState<string>();
  // ユーザーが入力した検索キーワードを管理するステート。検索機能に使用。
  const [searchInput, setSearchInput] = useState('');
  //検索中かどうかを管理するステート
  const [isSearch, setIsSearch] = useState(false);
  //検索結果を管理するステート
  const [searchResults, setSearchResults] = useState<PokemonModel[]>([]);

  const displayPokemons = isSearch ? searchResults : allPokemons;

  // 見た目がまったく同じカード(画像なしフォルム違いなど)は最初の1件(基本フォルム)に統一する
  const uniquePokemons = useMemo(() => uniqueByAppearance(displayPokemons ?? []), [displayPokemons]);

  // IntersectionObserverのフック
  const { ref, inView } = useInView({
    threshold: 0.8,
    rootMargin: '0px 0px 400px 0px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isSearch) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isSearch, fetchNextPage]);

  const onSearch = async () => {
    if (!(!searchInput && !selectedType)) {
      const filterPokemonList = await PokemonRepo.pokemonFilterQuery(searchInput, selectedType);
      setSearchResults(filterPokemonList);
      setIsSearch(true);
    }
  };

  const onReset = async () => {
    setSearchResults([]);
    setSearchInput('');
    setSelectedType('');
    setIsSearch(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 pb-[5rem] pt-[3rem]">
      <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">ポケモン図鑑</h1>
      <Search
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={onSearch}
        onReset={onReset}
      />
      <div className="app-container">
        <div className="pokemon-container">
          <div className="all-container">
            {uniquePokemons.map((pokemon) => (
              <Link key={pokemon.id} href={`/detail/${pokemon.name}`}>
                <PokemonThumbnails
                  id={pokemon.id}
                  name={pokemon.japaneseName}
                  image={pokemon.image}
                  iconImage={pokemon.iconImage}
                  japaneseTypes={pokemon.japaneseTypes}
                  types={pokemon.types}
                />
              </Link>
            ))}
          </div>
          <div ref={ref}></div>
        </div>
      </div>
    </div>
  );
}
