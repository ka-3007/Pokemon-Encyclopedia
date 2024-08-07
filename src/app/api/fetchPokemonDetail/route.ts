import { PokemonModel } from '@/model/pokemon';
import { PokemonRepo } from '@/repository/pokemon';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  try {
    const pokemonDetail = name && (await PokemonRepo.getPokemonDetail(name));

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

    return NextResponse.json({ pokemonDetail, newPokemonDetails }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
