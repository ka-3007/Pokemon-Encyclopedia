'use client';

import { PokemonModel } from '@/model/pokemon';
import { allPokemonsState, urlState } from '@/recoil/atom';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

export function RecoilProvider({
  children,
  initialPokemons,
  initialUrl,
}: {
  children: ReactNode;
  initialPokemons: PokemonModel[];
  initialUrl: string;
}) {
  return (
    <RecoilRoot
      initializeState={({ set }) => {
        set(allPokemonsState, initialPokemons);
        set(urlState, initialUrl);
      }}
    >
      {children}
    </RecoilRoot>
  );
}
