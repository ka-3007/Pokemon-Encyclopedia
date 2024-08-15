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
        try {
          // ポケモン詳細情報を取得する
          // まず、IndexedDBからキャッシュされたポケモンデータを取得し、存在しない場合はAPIから取得する
          const cachedPokemon = await getFromIndexedDB(name);
          let newPokemon = cachedPokemon || (await PokemonRepo.getPokemonDetail(name));
          setPokemon(newPokemon); // 取得したポケモンデータを状態にセットする

          // 進化データやフォーム違いがある場合、関連するポケモン情報を取得する
          if (newPokemon?.evolutionData || newPokemon?.formNames) {
            // 進化データ（通常進化、特殊進化）およびフォーム名を一つの配列にまとめる
            // 自分自身の名前は除外する
            const allPokemonNames = [
              ...(newPokemon.evolutionData?.normalEvolution || []),
              ...(newPokemon.evolutionData?.specialEvolution || []),
              ...(newPokemon.formNames || []),
            ].filter((relatedName) => relatedName !== newPokemon?.name);

            // それぞれのポケモン名に対して、詳細情報を取得する非同期処理を並列で実行する
            const pokemonDetailPromises = allPokemonNames.map(async (relatedName) => {
              try {
                // IndexedDBからキャッシュされたポケモンデータを取得し、存在しない場合はAPIから取得する
                const cachedRelatedPokemon = await getFromIndexedDB(relatedName);
                return cachedRelatedPokemon || (await PokemonRepo.getPokemonDetail(relatedName));
              } catch (error: any) {
                // エラーが発生した場合、エラーメッセージを表示し、undefinedを返す
                console.error(`Failed to fetch details for ${relatedName}:`, error);
                return undefined;
              }
            });

            // すべての関連ポケモンの詳細情報が取得されるのを待つ
            const relatedPokemonDetails = await Promise.all(pokemonDetailPromises);
            const newPokemonDetails: Record<string, PokemonModel> = {};

            // 取得されたポケモン詳細情報を新しいオブジェクトに格納する
            relatedPokemonDetails.forEach((detail, index) => {
              if (detail) {
                newPokemonDetails[allPokemonNames[index]] = detail;
              }
            });

            // 取得した関連ポケモン情報を状態にセットする
            setPokemonDetails(newPokemonDetails);
          }
        } catch (error: any) {
          // ポケモン詳細情報取得中にエラーが発生した場合、エラーメッセージを表示する
          console.error(error);
        }
      })();
    }
  }, [name]); // nameが変更されるたびに、上記の非同期処理を再実行する

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen flex flex-col items-center justify-center">
      {pokemon && <PokemonDetail pokemon={pokemon} pokemonDetails={pokemonDetails} key={pokemon.id} />}
    </div>
  );
}
