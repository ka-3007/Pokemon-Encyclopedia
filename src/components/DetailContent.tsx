'use client';
import { PokemonModel } from '@/model/pokemon';
import { getFromIndexedDB } from '@/repository/indexDB';
import { PokemonRepo } from '@/repository/pokemon';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PokemonDetail from './PokemonDetail';

export function DetailContent({
  pokemonDetail,
  newPokemonDetails,
}: {
  pokemonDetail: PokemonModel;
  newPokemonDetails: Record<string, PokemonModel>;
}) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  const [pokemon, setPokemon] = useState<PokemonModel | undefined>(pokemonDetail);
  const [pokemonDetails, setPokemonDetails] = useState<Record<string, PokemonModel>>(newPokemonDetails);

  useEffect(() => {
    if (name) {
      (async function () {
        //ポケモン詳細情報取得
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

        //ポケモン関連情報取得
        if (pokemon?.evolutionData || pokemon?.formNames) {
          const allPokemonNames = [
            ...pokemon?.evolutionData?.normalEvolution?.map((name) => name),
            ...pokemon?.evolutionData?.specialEvolution?.map((name) => name),
          ];

          const newPokemonDetails: Record<string, PokemonModel> = {};

          for (const name of allPokemonNames) {
            if (name !== pokemon?.name) {
              try {
                // IndexedDBからポケモンデータを取得しようとする
                const cachedPokemon = await getFromIndexedDB(name);
                if (cachedPokemon) {
                  // IndexedDBにデータが存在する場合、それを使用する
                  newPokemonDetails[name] = cachedPokemon;
                } else {
                  const pokemon = await PokemonRepo.getPokemonDetail(name);
                  if (pokemon) {
                    newPokemonDetails[name] = pokemon;
                  }
                }
              } catch (error: any) {
                console.error(`Failed to fetch details for ${name}:`, error);
              }
            }
          }

          if (pokemon?.formNames) {
            // フォーム違いのポケモン詳細を取得
            for (const name of pokemon?.formNames) {
              if (name !== pokemon?.name) {
                try {
                  // IndexedDBからポケモンデータを取得しようとする
                  const cachedPokemon = await getFromIndexedDB(name);
                  if (cachedPokemon) {
                    // IndexedDBにデータが存在する場合、それを使用する
                    newPokemonDetails[name] = cachedPokemon;
                  } else {
                    const pokemon = await PokemonRepo.getPokemonDetail(name);
                    if (pokemon) {
                      newPokemonDetails[name] = pokemon;
                    }
                  }
                } catch (error: any) {
                  console.error(`Failed to fetch details for ${name}:`, error);
                }
              }
            }
          }

          setPokemonDetails(newPokemonDetails);
        }
      })();
    }
  }, [name, pokemon?.evolutionData, pokemon?.formNames, pokemon?.name]);

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen flex flex-col items-center justify-center">
      {pokemon && (
        <PokemonDetail
          id={pokemon.id}
          jpName={pokemon.japaneseName}
          image={pokemon.image}
          japaneseTypes={pokemon.japaneseTypes}
          description={pokemon.description}
          types={pokemon.types}
          height={pokemon.height}
          weight={pokemon.weight}
          pokemonDetails={pokemonDetails}
          key={pokemon.id}
        />
      )}
    </div>
  );
}
