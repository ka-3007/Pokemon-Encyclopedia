import { NextRequest, NextResponse } from 'next/server';

import { getPokemonPage } from '@/lib/pokemonServer';

// 無限スクロールの2ページ目以降で使用する。getPokemonPageはサーバー側で
// 1日キャッシュされるため、同じページへのリクエストでFirestoreは読まれない
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = Number(searchParams.get('offset')) || 0;

  try {
    const page = await getPokemonPage(offset);
    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error('Error fetching pokemon page:', error);
    return NextResponse.json({ error: 'Failed to fetch pokemons' }, { status: 500 });
  }
}
