import type { ResultListing } from '@byb/schemas';
import { computeLandedCost } from './landed-cost';

/** pnpm demo:validate: walks a parsed JSON value and reports every leftover "TODO" string, by path. */
export function findTodoPaths(value: unknown, path = ''): string[] {
  if (typeof value === 'string') {
    return value.includes('TODO') ? [path] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => findTodoPaths(item, `${path}[${i}]`));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) =>
      findTodoPaths(v, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

/**
 * pnpm demo:validate: recomputes landedPrice from listedPrice/shippingCost/
 * estimatedTax and reports a mismatch — catches hand-entered demo figures that
 * don't add up (rule 3/4).
 */
export function checkLandedCostArithmetic(listing: ResultListing): string | null {
  const expected = computeLandedCost({
    listedPrice: listing.listedPrice,
    shippingCost: listing.shippingCost,
    estimatedTax: listing.estimatedTax,
  });

  if (
    expected.landedPrice.minCents !== listing.landedPrice.minCents ||
    expected.landedPrice.maxCents !== listing.landedPrice.maxCents
  ) {
    return `landedPrice ${JSON.stringify(listing.landedPrice)} does not equal listedPrice + shippingCost + estimatedTax (${JSON.stringify(expected.landedPrice)})`;
  }

  if (expected.landedPriceComplete !== listing.landedPriceComplete) {
    return `landedPriceComplete is ${listing.landedPriceComplete} but should be ${expected.landedPriceComplete} given shippingCost/estimatedTax`;
  }

  if (JSON.stringify(expected.uncertainComponents) !== JSON.stringify(listing.uncertainComponents)) {
    return `uncertainComponents ${JSON.stringify(listing.uncertainComponents)} should be ${JSON.stringify(expected.uncertainComponents)}`;
  }

  return null;
}
