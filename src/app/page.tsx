'use client';
import PokemonThumbnails from '@/components/PokemonThumbnails';
import Search from '@/components/Search';
import { useGetAllPokemons } from '@/hooks/useGetAllPokemons';
import { PokemonModel } from '@/model/pokemon';
import { allPokemonsState } from '@/recoil/atom';
import { PokemonRepo } from '@/repository/pokemon';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  const { isLoading, getAllPokemons } = useGetAllPokemons();
  const allPokemons = useRecoilValue(allPokemonsState);
  // ユーザーが選択したポケモンのタイプを管理するステート。フィルター機能に使用。
  const [selectedType, setSelectedType] = useState<string>();
  // ユーザーが入力した検索キーワードを管理するステート。検索機能に使用。
  const [searchInput, setSearchInput] = useState('');
  //検索中かどうかを管理するステート
  const [isSearch, setIsSearch] = useState(false);
  //表示するポケモンを管理するステート
  const [displayPokémon, setDisplayPokémon] = useState<PokemonModel[]>(allPokemons);

  // IntersectionObserverのフック
  const { ref, inView } = useInView({
    threshold: 0.8,
    rootMargin: '0px 0px 400px 0px',
  });

  useEffect(() => {
    // if (allPokemons.length === 0) {
    //   getAllPokemons();
    // }
    setDisplayPokémon(allPokemons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPokemons]);

  useEffect(() => {
    if (inView && !isLoading && !isSearch) {
      getAllPokemons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, isLoading, isSearch]);

  const onSearch = async () => {
    if (!(!searchInput && !selectedType)) {
      const filterPokemonList = await PokemonRepo.pokemonFilterQuery(searchInput, selectedType);
      setDisplayPokémon(filterPokemonList);
      setIsSearch(true);
    }
  };

  const onReset = async () => {
    setDisplayPokémon(allPokemons);
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
            {Array.from(new Map(displayPokémon?.map((pokemon) => [pokemon.id, pokemon])).values()).map((pokemon) => (
              <Link key={pokemon.id} href={`/detail?name=${pokemon.name}`}>
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
