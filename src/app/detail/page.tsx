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
    <Suspense fallback={<div>Loading...</div>}>
      <DetailContent pokemonDetail={pokemonDetail} newPokemonDetails={newPokemonDetails} />
    </Suspense>
  );
}
