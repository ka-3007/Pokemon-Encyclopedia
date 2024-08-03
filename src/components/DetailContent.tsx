import { PokemonModel } from '@/model/pokemon';
import { getFromIndexedDB } from '@/repository/indexDB';
import { PokemonRepo } from '@/repository/pokemon';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PokemonDetail from './PokemonDetail';

export function DetailContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  const [pokemon, setPokemon] = useState<PokemonModel>();

  useEffect(() => {
    if (name) {
      (async function () {
        try {
          // IndexedDBからポケモンデータを取得しようとする
          const cachedPokemon = await getFromIndexedDB(name);
          if (cachedPokemon) {
            // IndexedDBにデータが存在する場合、それを使用する
            setPokemon(cachedPokemon);
          } else {
            const pokemon = await PokemonRepo.getPokemonDetail(name);
            setPokemon(pokemon);
          }
        } catch (error: any) {
          console.error(error);
        }
      })();
    }
  }, [name]);

  return (
    <div className="p-16 bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen font-sans flex items-center justify-center">
      {pokemon && (
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
      )}
    </div>
  );
}
