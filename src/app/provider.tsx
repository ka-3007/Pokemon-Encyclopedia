'use client';

import React, { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

export default function AppProvider({ children }: { children: ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
