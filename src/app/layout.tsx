import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProvider from './provider';
import { PokemonModel } from '@/model/pokemon';
import axios from 'axios';
import { PokemonRepo } from '@/repository/pokemon';
import { getDoc } from 'firebase/firestore';
import fetchPokemonData from '@/services/fetchPokemonData';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata() {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL!);
  return {
    title: 'ポケモン図鑑',
    description: 'ポケモンの詳細情報を提供する図鑑アプリケーション',
    metadataBase,
    openGraph: {
      title: 'ポケモン図鑑 - すべてのポケモンをチェックしよう！',
      description: 'ポケモンのタイプ、特徴、ステータスなど、詳細情報を簡単に閲覧できるポケモン図鑑。',
      url: metadataBase.toString(),
      images: [
        {
          url: [new URL('/favicon.ico', metadataBase).toString()],
          width: 1200,
          height: 628,
          alt: 'ポケモン図鑑のOG画像',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ポケモン図鑑 - 詳細情報をチェック！',
      description: 'ポケモンのタイプ、特徴、ステータスを詳しく確認できるポケモン図鑑アプリ。',
      images: [new URL('/favicon.ico', metadataBase).toString()],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/getAllPokemons`, {
  //   cache: 'no-store',
  // });
  // const { allPokemons, nextUrl }: { allPokemons: PokemonModel[]; nextUrl: string } = await response.json();

  const { allPokemons, nextUrl }: { allPokemons: PokemonModel[]; nextUrl: string } = await getAllPokemons();

  return (
    <html lang="ja">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AppProvider initialPokemons={allPokemons} initialUrl={nextUrl}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

async function getAllPokemons() {
  // 指定されたURLからポケモンデータを取得
  const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=50');
  const data = response.data;

  const pokemonPromises = data.results.map(async (pokemon: PokemonModel) => {
    // Firebaseからポケモンデータを取得しようとする
    const pokemonDoc = await getDoc(PokemonRepo.pokemonDocRef(pokemon.name));

    if (pokemonDoc.exists()) {
      // Firebaseにデータが存在する場合、それを使用する
      const data = pokemonDoc.data() as PokemonModel;

      return data;
    } else {
      const pokemonData = await fetchPokemonData(pokemon.name);

      return pokemonData;
    }
  });

  // すべてのポケモンのプロミスが解決するのを待ち、その結果を取得
  const newPokemons = (await Promise.all(pokemonPromises)).filter((pokemon) => pokemon !== null);
  //ソート
  const allPokemons = newPokemons.sort((a, b) => a.id - b.id);

  return { allPokemons, nextUrl: data.next };
}
