'use client';

import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React, { ReactNode, useState } from 'react';

import AnalyticsProvider from '@/components/AnalyticsProvider';
import { idbStorage } from '@/lib/queryPersister';
import { CACHE_TTL_MS, CACHE_VERSION_TAG } from '@/config/cache';

export default function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ポケモンデータはほぼ不変なので1日はキャッシュを使い、再取得しない
            staleTime: CACHE_TTL_MS,
            gcTime: CACHE_TTL_MS,
            retry: 1,
          },
        },
      }),
  );
  const [persister] = useState(() => createAsyncStoragePersister({ storage: idbStorage }));

  return (
    <PersistQueryClientProvider
      client={queryClient}
      // busterはPOKEMON_DATA_VERSIONに連動しており、バージョンを上げると既存の永続キャッシュが無効化される
      persistOptions={{ persister, maxAge: CACHE_TTL_MS, buster: CACHE_VERSION_TAG }}
    >
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </PersistQueryClientProvider>
  );
}
