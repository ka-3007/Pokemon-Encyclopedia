'use client';

import AnalyticsProvider from '@/components/AnalyticsProvider';
import React, { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <RecoilRoot>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </RecoilRoot>
  );
}
