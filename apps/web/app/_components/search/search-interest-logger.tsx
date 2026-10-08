'use client';

import { useEffect } from 'react';
import type { SearchQueryType } from '@byb/schemas';

/** Fires once per /search view; best-effort, never blocks or retries. */
export function SearchInterestLogger({
  normalizedQuery,
  queryType,
  matchedDemo,
}: {
  normalizedQuery: string;
  queryType: SearchQueryType;
  matchedDemo: boolean;
}) {
  useEffect(() => {
    fetch('/api/search-interest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ normalizedQuery, queryType, matchedDemo }),
    }).catch(() => {});
  }, [normalizedQuery, queryType, matchedDemo]);

  return null;
}
