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
    if (pokemonDetail.evolutionData || pokemonDetail.formNames) {
      const allPokemonNames = [
        ...(pokemonDetail.evolutionData?.normalEvolution || []),
        ...(pokemonDetail.evolutionData?.specialEvolution || []),
        ...(pokemonDetail.formNames || []),
      ].filter((relatedName) => relatedName !== pokemonDetail.name);

      // すべての関連ポケモンの詳細を並列で取得
      const pokemonDetailPromises = allPokemonNames.map(async (relatedName) => {
        try {
          const pokemon = await PokemonRepo.getPokemonDetail(relatedName);
          return { name: relatedName, detail: pokemon };
        } catch (error: any) {
          console.error(`Failed to fetch details for ${relatedName}:`, error);
          return { name: relatedName, detail: undefined };
        }
      });

      const relatedPokemonDetails = await Promise.all(pokemonDetailPromises);

      // 取得した詳細情報を newPokemonDetails オブジェクトに格納
      relatedPokemonDetails.forEach(({ name, detail }) => {
        if (detail) {
          newPokemonDetails[name] = detail;
        }
      });
    }
  }

  return { pokemonDetail, newPokemonDetails };
}
