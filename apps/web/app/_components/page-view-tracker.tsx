'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** M0.7: fires `page_view` on first render and on every client-side navigation. */
export function PageViewTracker() {
  const path = usePathname();

  useEffect(() => {
    track({ name: 'page_view', props: { path } });
  }, [path]);

  return null;
}
