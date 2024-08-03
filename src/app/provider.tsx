'use client';

import React, { ReactNode, useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { useGetAllPokemons } from './hooks/useGetAllPokemons';

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <RecoilRoot>
      <PokemonListener>{children}</PokemonListener>
    </RecoilRoot>
  );
}

const PokemonListener = ({ children }: { children: React.ReactNode }) => {
  const { getAllPokemons } = useGetAllPokemons();

  useEffect(() => {
    getAllPokemons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
