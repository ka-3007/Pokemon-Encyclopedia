'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import PokemonThumbnails from '@/components/PokemonThumbnails';
import Search from '@/components/Search';
import { PokemonPage } from '@/lib/pokemonServer';
import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import { uniqueByAppearance } from '@/utils/pokemonAppearance';

// 詳細ページへ移動する直前のスクロール位置の保存先キー
const SCROLL_POSITION_KEY = 'home-scroll-position';

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

  // 詳細ページから戻ってきたときに保存しておいたスクロール位置へ復元する。
  // 一覧の高さはキャッシュ復元で徐々に伸びるため、復元先まで届く高さになるのを待つ
  const pendingScrollY = useRef<number | null>(null);
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_POSITION_KEY);
    sessionStorage.removeItem(SCROLL_POSITION_KEY);
    if (saved === null) return;
    pendingScrollY.current = Number(saved);
    // キャッシュがクリアされているなど、高さが復元されない場合は諦める
    const timer = setTimeout(() => {
      pendingScrollY.current = null;
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (pendingScrollY.current === null) return;
    const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
    if (pendingScrollY.current <= maxScrollY) {
      window.scrollTo(0, pendingScrollY.current);
      pendingScrollY.current = null;
    }
  }, [allPokemons.length]);

  // 詳細ページへ移動する直前に現在のスクロール位置を保存する
  const saveScrollPosition = () => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
  };

  const onSearch = async (searchInput: string, selectedType: string | undefined) => {
    if (!(!searchInput && !selectedType)) {
      const filterPokemonList = await PokemonRepo.pokemonFilterQuery(searchInput, selectedType);
      setSearchResults(filterPokemonList);
      setIsSearch(true);
    }
  };

  const onReset = async () => {
    setSearchResults([]);
    setIsSearch(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 pb-[5rem] pt-[3rem]">
      <h1 className="text-center text-4xl font-bold text-gray-800 mb-4">ポケモン図鑑</h1>
      <Search onSearch={onSearch} onReset={onReset} />
      <div className="app-container">
        <div className="pokemon-container">
          <div className="all-container">
            {uniquePokemons.map((pokemon) => (
              <Link key={pokemon.id} href={`/detail/${pokemon.name}`} onClick={saveScrollPosition}>
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
