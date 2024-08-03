'use client';

import { ReactNode, useEffect } from 'react';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view');
    }
  }, []);

  return children;
}
