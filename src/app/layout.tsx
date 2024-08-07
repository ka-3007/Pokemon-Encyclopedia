import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProvider from './provider';
import { headers } from 'next/headers';
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
  const headersList = headers();
  const host = headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${proto}://${host}`;
  const response = await fetch(`${baseUrl}/api/getAllPokemons`, {
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
