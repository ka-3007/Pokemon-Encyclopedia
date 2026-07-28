'use client';

import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React, { ReactNode, useState } from 'react';

import AnalyticsProvider from '@/components/AnalyticsProvider';
import { idbStorage } from '@/lib/queryPersister';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export default function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ポケモンデータはほぼ不変なので1日はキャッシュを使い、再取得しない
            staleTime: ONE_DAY_MS,
            gcTime: ONE_DAY_MS,
            retry: 1,
          },
        },
      }),
  );
  const [persister] = useState(() => createAsyncStoragePersister({ storage: idbStorage }));

  return (
    <PersistQueryClientProvider
      client={queryClient}
      // busterを変えると既存の永続キャッシュを無効化できる(データ構造変更時に更新する)
      persistOptions={{ persister, maxAge: ONE_DAY_MS, buster: 'v1' }}
    >
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </PersistQueryClientProvider>
  );
}
