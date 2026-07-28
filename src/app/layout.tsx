import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProvider from './provider';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
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
          url: new URL('/favicon.ico', metadataBase).toString(),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
