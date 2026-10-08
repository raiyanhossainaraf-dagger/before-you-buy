'use client';

import { usePathname } from 'next/navigation';
import { SearchCombobox } from './search-combobox';

/** UI §3: the header carries the compact search on inner pages; home keeps its own hero combobox. */
export function HeaderSearch() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <SearchCombobox compact />;
}
