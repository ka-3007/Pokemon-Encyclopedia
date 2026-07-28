import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PokemonDetail from '@/components/PokemonDetail';
import { getPokemonDetail, getPokemonDetailWithRelated } from '@/lib/pokemonServer';

type Props = {
  params: {
    name: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pokemon = await getPokemonDetail(params.name);
  if (!pokemon) return {};

  return {
    title: `${pokemon.japaneseName} | ポケモン図鑑`,
    description: pokemon.description,
  };
}

export default async function Detail({ params }: Props) {
  const { pokemonDetail, newPokemonDetails } = await getPokemonDetailWithRelated(params.name);

  if (!pokemonDetail) {
    notFound();
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen flex flex-col items-center justify-center">
      <PokemonDetail pokemon={pokemonDetail} pokemonDetails={newPokemonDetails} />
    </div>
  );
}
