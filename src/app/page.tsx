import HomeClient from '@/components/HomeClient';
import { getPokemonPage } from '@/lib/pokemonServer';

export default async function Home() {
  // 最初の1ページ分はサーバーで取得して初期表示に使う(unstable_cacheで1日キャッシュ)
  const initialPage = await getPokemonPage(0);

  return <HomeClient initialPage={initialPage} />;
}
