import { DetailContent } from '@/components/DetailContent';
import { PokemonModel } from '@/model/pokemon';
import { headers } from 'next/headers';
import { Suspense } from 'react';

export default async function Detail({
  searchParams,
}: {
  searchParams: {
    name: string;
  };
}) {
  const headersList = headers();
  const host = headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${proto}://${host}`;
  const response = await fetch(`${baseUrl}/api/fetchPokemonDetail?name=${searchParams.name}`, {
    cache: 'no-store',
  });
  const {
    pokemonDetail,
    newPokemonDetails,
  }: { pokemonDetail: PokemonModel; newPokemonDetails: Record<string, PokemonModel> } = await response.json();
  return (
    <Suspense
      fallback={
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen flex flex-col items-center justify-center"></div>
      }
    >
      <DetailContent pokemonDetail={pokemonDetail} newPokemonDetails={newPokemonDetails} />
    </Suspense>
  );
}
