import { demoComparisonSchema, type DemoComparison } from '@byb/schemas';
import sonyWh1000xm5 from '../content/demo/sony-wh-1000xm5.json';
import robotVacuum from '../content/demo/robot-vacuum.json';
import ipadBase from '../content/demo/ipad-base.json';

/**
 * Shared with `app/_components/landing/slots.tsx` and `/search` — only
 * comparisons whose captured data already validates are shown (M0.3).
 */
export function loadDemoComparisons(): DemoComparison[] {
  return [sonyWh1000xm5, robotVacuum, ipadBase]
    .map((raw) => demoComparisonSchema.safeParse(raw))
    .filter((result) => result.success)
    .map((result) => result.data);
}

const STOPWORDS = new Set([
  'the',
  'with',
  'and',
  'for',
  'base',
  'model',
  'wi-fi',
  'current',
]);

function keywordsOf(comparison: DemoComparison): Set<string> {
  const haystack = `${comparison.product.brand} ${comparison.product.name} ${comparison.product.category}`;
  const words = haystack
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return new Set(words);
}

/**
 * Gate 0 heuristic: a normalized query matches a demo product when it shares
 * at least one non-trivial word with that product's brand/name/category.
 * Three products, hand-checked — not the real matching pipeline (TR-MATCH).
 */
export function matchDemoProduct(
  normalizedQuery: string,
  comparisons: DemoComparison[],
): DemoComparison | undefined {
  const queryWords = normalizedQuery.split(/[^a-z0-9-]+/).filter((w) => w.length >= 3);
  if (queryWords.length === 0) return undefined;

  return comparisons.find((comparison) => {
    const keywords = [...keywordsOf(comparison)];
    return queryWords.some((word) => keywords.some((k) => k.includes(word) || word.includes(k)));
  });
}
