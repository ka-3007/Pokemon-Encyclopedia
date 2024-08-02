'use client';

import PokemonDetail from '@/components/PokemonDetail';
import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Detail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [pokemons, setPokemons] = useState<PokemonModel[]>();

  useEffect(() => {
    if (id) {
      (async function () {
        try {
          const pokemons = await PokemonRepo.pokemonDetailQuery(Number(id));
          setPokemons(pokemons);
        } catch (error: any) {
          console.error(error);
        }
      })();
    }
  }, [id]);

  return (
    <div className="p-16 bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen font-sans flex items-center justify-center">
      {pokemons?.map((pokemon) => (
        <PokemonDetail
          id={pokemon.id}
          name={pokemon.japaneseName}
          image={pokemon.image}
          japaneseTypes={pokemon.japaneseTypes}
          description={pokemon.description}
          types={pokemon.types}
          height={pokemon.height}
          weight={pokemon.weight}
          key={pokemon.id}
        />
      ))}
    </div>
  );
}
