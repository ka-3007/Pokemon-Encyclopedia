import { DetailContent } from '@/components/DetailContent';
import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import { Suspense } from 'react';

export default async function Detail({
  searchParams,
}: {
  searchParams: {
    name: string;
  };
}) {
  // const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/fetchPokemonDetail?name=${searchParams.name}`, {
  //   cache: 'no-store',
  // });
  // const {
  //   pokemonDetail,
  //   newPokemonDetails,
  // }: { pokemonDetail: PokemonModel; newPokemonDetails: Record<string, PokemonModel> } = await response.json();

  const {
    pokemonDetail,
    newPokemonDetails,
  }: { pokemonDetail: PokemonModel; newPokemonDetails: Record<string, PokemonModel> } = await fetchPokemonDetail(
    searchParams.name,
  );

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

async function fetchPokemonDetail(name: string) {
  const pokemonDetail = (name && (await PokemonRepo.getPokemonDetail(name))) as PokemonModel;

  const newPokemonDetails: Record<string, PokemonModel> = {};
  if (pokemonDetail) {
    if (pokemonDetail?.evolutionData || pokemonDetail?.formNames) {
      const allPokemonNames = [
        ...pokemonDetail?.evolutionData?.normalEvolution?.map((name) => name),
        ...pokemonDetail?.evolutionData?.specialEvolution?.map((name) => name),
      ];

      for (const name of allPokemonNames) {
        if (name !== pokemonDetail?.name) {
          const pokemon = await PokemonRepo.getPokemonDetail(name);
          if (pokemon) {
            newPokemonDetails[name] = pokemon;
          }
        }
      }

      if (pokemonDetail?.formNames) {
        // フォーム違いのポケモン詳細を取得
        for (const name of pokemonDetail?.formNames) {
          if (name !== pokemonDetail?.name) {
            const pokemon = await PokemonRepo.getPokemonDetail(name);
            if (pokemon) {
              newPokemonDetails[name] = pokemon;
            }
          }
        }
      }
    }
  }

  return { pokemonDetail, newPokemonDetails };
}
