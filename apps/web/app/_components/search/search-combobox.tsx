'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { loadDemoComparisons } from '@/lib/demo-comparisons';

const PLACEHOLDER = 'Search a product, or paste an Amazon, eBay or Best Buy link';

/**
 * UI §7.1/§10 `SearchCombobox` — Gate 0 version. Autocomplete only ever
 * suggests the three demo products (real search ships later); submitting
 * any other text still navigates to `/search?q=`, which shows the honest
 * preview (Prompt B item 3).
 */
export function SearchCombobox({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const inputId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const needle = value.trim().toLowerCase();
    if (needle.length < 2) return [];
    return loadDemoComparisons()
      .filter((c) => c.product.name.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [value]);

  // Native GET submission (typed Next.js routes can't express a dynamic
  // `?q=`): set the input's value directly, then submit the form — the same
  // navigation Enter would trigger.
  function selectSuggestion(name: string) {
    setOpen(false);
    if (inputRef.current) inputRef.current.value = name;
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action="/search"
      method="get"
      role="search"
      className={compact ? 'relative w-full max-w-xs' : 'relative mx-auto mt-8 max-w-xl text-left'}
    >
      <label htmlFor={inputId} className="sr-only">
        Search a product
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name="q"
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        placeholder={PLACEHOLDER}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        className="min-h-11 w-full rounded-control border border-border bg-card px-4 text-sm text-foreground"
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Demo products"
          className="absolute inset-x-0 top-full z-10 mt-1 rounded-control border border-border bg-card shadow-lg"
        >
          {suggestions.map((comparison) => (
            <li key={comparison.slug} role="option" aria-selected="false">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(comparison.product.name)}
                className="flex min-h-11 w-full items-center px-4 text-left text-sm hover:bg-muted"
              >
                {comparison.product.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
