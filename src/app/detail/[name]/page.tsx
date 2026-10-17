import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PokemonDetail from '@/components/PokemonDetail';
import { getPokemonDetail, getPokemonDetailWithRelated } from '@/lib/pokemonServer';

type Props = {
  params: Promise<{
    name: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const pokemon = await getPokemonDetail(name);
  if (!pokemon) return {};

  return {
    title: `${pokemon.japaneseName} | ポケモン図鑑`,
    description: pokemon.description,
  };
}

export default async function Detail({ params }: Props) {
  const { name } = await params;
  const { pokemonDetail, newPokemonDetails } = await getPokemonDetailWithRelated(name);

  if (!pokemonDetail) {
    notFound();
  }

  return (
    <div className="bg-linear-to-br from-blue-100 to-purple-100 min-h-screen flex flex-col items-center justify-center">
      <PokemonDetail pokemon={pokemonDetail} pokemonDetails={newPokemonDetails} />
    </div>
  );
}
