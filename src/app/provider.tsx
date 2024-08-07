'use client';

import AnalyticsProvider from '@/components/AnalyticsProvider';
import { RecoilProvider } from '@/components/RecoilProvider';
import { PokemonModel } from '@/model/pokemon';
import React, { ReactNode } from 'react';

export default function AppProvider({
  children,
  initialPokemons,
  initialUrl,
}: {
  children: ReactNode;
  initialPokemons: PokemonModel[];
  initialUrl: string;
}) {
  return (
    <RecoilProvider initialPokemons={initialPokemons} initialUrl={initialUrl}>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </RecoilProvider>
  );
}
