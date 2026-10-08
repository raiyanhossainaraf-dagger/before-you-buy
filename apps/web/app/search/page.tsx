import type { Metadata } from 'next';
import Link from 'next/link';
import { normalizeQuery, parseRetailerUrl } from '@byb/core';
import { loadDemoComparisons, matchDemoProduct } from '@/lib/demo-comparisons';
import { DemoPicker } from '../_components/landing/demo-picker';
import { SearchInterestLogger } from '../_components/search/search-interest-logger';

export const metadata: Metadata = { title: 'Search' };

/** Rule 4 / TR-LC-05 pattern: say what we know, never fake a result (Prompt B item 3). */
function NotLivePreview({ heading, body, query }: { heading: string; body: string; query: string }) {
  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{body}</p>
      <Link
        href={`/notify?q=${encodeURIComponent(query)}`}
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Get notified when you can check &apos;{query}&apos;
      </Link>
    </main>
  );
}

/**
 * Prompt B item 3 — matches the three demo products or shows an honest
 * preview; never fakes a result. URL parsing never fetches the pasted URL
 * (rule 2) — only string parsing from `packages/core`.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const raw = q?.trim();

  if (!raw) {
    return (
      <main id="main" className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Search for a product</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Type a product name, or paste an Amazon, eBay or Best Buy link.
        </p>
      </main>
    );
  }

  const loggedQuery = raw.slice(0, 200);
  const urlResult = parseRetailerUrl(raw);

  // Any URL outcome is a preview — the three demo products have no retailer
  // link to match against, so only the shortlink case gets its own copy.
  const isShortlink = urlResult && !urlResult.ok && urlResult.code === 'URL_SHORTLINK_UNSUPPORTED';
  const heading = isShortlink ? "Short links can't be checked" : "We're not live yet";
  const body = isShortlink
    ? urlResult.message
    : urlResult
      ? "We're not live yet. Get notified when you can check that link."
      : `We're not live yet. Get notified when you can check '${raw}'.`;

  const normalizedQuery = urlResult ? loggedQuery : normalizeQuery(raw);
  const matched = urlResult ? undefined : matchDemoProduct(normalizedQuery, loadDemoComparisons());

  return (
    <>
      <SearchInterestLogger
        normalizedQuery={normalizedQuery || loggedQuery}
        queryType={urlResult ? 'url' : 'name'}
        matchedDemo={Boolean(matched)}
      />
      {matched ? (
        <main id="main" className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-2xl font-semibold tracking-tight">{matched.product.name}</h1>
          <div className="mt-6">
            <DemoPicker comparisons={[matched]} />
          </div>
        </main>
      ) : (
        <NotLivePreview heading={heading} body={body} query={raw} />
      )}
    </>
  );
}
