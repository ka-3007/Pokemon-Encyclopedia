import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProvider from './provider';
import { PokemonModel } from '@/model/pokemon';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ポケモン図鑑',
  description: 'ポケモンの詳細情報を提供する図鑑アプリケーション',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/getAllPokemons`, {
    cache: 'no-store',
  });
  const { allPokemons, nextUrl }: { allPokemons: PokemonModel[]; nextUrl: string } = await response.json();

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
