'use client';

import { DetailContent } from '@/components/DetailContent';
import { Suspense } from 'react';

export default function Detail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}
