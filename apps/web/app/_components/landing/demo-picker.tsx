'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ResultCard } from '@byb/ui';
import type { DemoComparison } from '@byb/schemas';

const capturedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

/** UI §7.14: 3-product demo picker. Tabs switch which comparison is shown; no auto-rotation. */
export function DemoPicker({ comparisons }: { comparisons: DemoComparison[] }) {
  const [activeSlug, setActiveSlug] = useState(comparisons[0]?.slug);
  const active = comparisons.find((c) => c.slug === activeSlug);

  if (!active) return null;

  const byId = new Map(active.listings.map((listing) => [listing.listingId, listing]));

  return (
    <div data-slot="demo-m0-3">
      <div role="tablist" aria-label="Demo product" className="flex flex-wrap gap-2">
        {comparisons.map((comparison) => (
          <button
            key={comparison.slug}
            type="button"
            role="tab"
            aria-selected={comparison.slug === activeSlug}
            onClick={() => setActiveSlug(comparison.slug)}
            className="min-h-11 rounded-control border border-border px-4 text-sm aria-selected:bg-primary aria-selected:text-primary-foreground"
          >
            {comparison.product.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {active.product.image ? (
          <Image
            src={active.product.image.src}
            alt={active.product.image.alt}
            width={56}
            height={56}
            className="shrink-0 rounded-control bg-muted"
          />
        ) : null}
        <div>
          <h3 className="text-sm font-medium">{active.product.name}</h3>
          <p className="text-xs text-muted-foreground">
            Sample captured on {capturedDate.format(new Date(active.capturedAt))}
          </p>
        </div>
      </div>

      <div aria-busy="false" className="mt-4 grid gap-4 sm:grid-cols-3">
        {active.ranking.top.map((entry) => {
          const listing = byId.get(entry.listingId);
          if (!listing) return null;
          return (
            <ResultCard
              key={entry.listingId}
              listing={listing}
              rank={entry.rank}
              label={entry.label}
              reasons={entry.reasons}
              zip={active.zip}
              history={active.history}
              illustrativeHistory={active.history.illustrative}
              illustrativeTrust={listing.reviewAuthenticity.illustrative}
            />
          );
        })}
      </div>
    </div>
  );
}
