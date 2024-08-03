'use client';
import PokemonThumbnails from '@/components/PokemonThumbnails';
import Search from '@/components/Search';
import { PokemonModel } from '@/model/pokemon';
import { allPokemonsState } from '@/recoil/atom';
import { PokemonRepo } from '@/repository/pokemon';
import Link from 'next/link';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useGetAllPokemons } from './hooks/useGetAllPokemons';

export default function Home() {
  const { isLoading, getAllPokemons } = useGetAllPokemons();
  const allPokemons = useRecoilValue(allPokemonsState);
  // ユーザーが選択したポケモンのタイプを管理するステート。フィルター機能に使用。
  const [selectedType, setSelectedType] = useState<string>();
  // ユーザーが入力した検索キーワードを管理するステート。検索機能に使用。
  const [searchInput, setSearchInput] = useState('');
  // フィルタリングされたポケモンデータを格納するステート。表示するデータを管理。
  const [filterPokemons, setFilterPokemons] = useState<PokemonModel[]>();

  const onSearch = async () => {
    const filterPokemonList = await PokemonRepo.pokemonFilterQuery(searchInput, selectedType);
    setFilterPokemons(filterPokemonList);
  };

  const onReset = async () => {
    setFilterPokemons(undefined);
    setSearchInput('');
    setSelectedType('');
  };

  if (allPokemons.length === 0) return;

  return (
    <>
      <Search selectedType={selectedType} setSelectedType={setSelectedType} onSearch={onSearch} onReset={onReset} />
      <div className="app-container">
        <div className="pokemon-container">
          <div className="all-container">
            {!filterPokemons ? (
              <>
                {allPokemons.map((pokemon) => (
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
              </>
            ) : (
              filterPokemons.map((pokemon) => (
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
              ))
            )}
          </div>
          {!filterPokemons &&
            (isLoading ? (
              <div className="load-more">読み込み中...</div>
            ) : (
              <button className="load-more" onClick={getAllPokemons}>
                もっとみる！
              </button>
            ))}
        </div>
      </div>
    </>
  );
}
