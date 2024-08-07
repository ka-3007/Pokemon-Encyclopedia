import { DetailContent } from '@/components/DetailContent';
import { PokemonModel } from '@/model/pokemon';
import { Suspense } from 'react';

export default async function Detail() {
  return (
    <Suspense
      fallback={
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen flex flex-col items-center justify-center"></div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
