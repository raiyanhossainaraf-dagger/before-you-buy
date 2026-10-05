import { describe, expect, it } from 'vitest';
import { checkLandedCostArithmetic, findTodoPaths } from '../demo-validate';
import type { ResultListing } from '@byb/schemas';

const baseListing = {
  listingId: 'l1',
  platform: 'amazon',
  title: 'Sony WH-1000XM5 Wireless Headphones (Black)',
  condition: 'new',
  seller: { name: 'Amazon.com', isRetailer: true },
  warranty: { months: 12, provider: 'manufacturer' },
  returns: { windowDays: 30, freeReturns: true },
  inStock: true,
  match: { confidence: 0.99, variant: 'exact', method: 'gtin' },
  listedPrice: { amountCents: 29999, currency: 'USD' },
  shippingCost: { amountCents: 0, currency: 'USD' },
  estimatedTax: { amountCents: 2842, currency: 'USD' },
  landedPrice: { minCents: 32841, maxCents: 32841, currency: 'USD' },
  landedPriceComplete: true,
  uncertainComponents: [],
  priceVerification: { status: 'not_required' },
  reviewAuthenticity: {
    score: 80,
    band: 'consistent',
    signals: [],
    reviewCount: 100,
    averageRating: 4.5,
    analyzedAt: '2026-10-01T00:00:00.000Z',
    modelVersion: 'trust-v1',
  },
  checkedAt: '2026-10-01T00:00:00.000Z',
  affiliate: { isAffiliate: false },
} as unknown as ResultListing;

describe('findTodoPaths', () => {
  it('finds a TODO string nested inside an object', () => {
    const paths = findTodoPaths({ product: { name: 'TODO' } });
    expect(paths).toEqual(['product.name']);
  });

  it('finds a TODO string nested inside an array', () => {
    const paths = findTodoPaths({ listings: [{ title: 'ok' }, { title: 'TODO: fill in' }] });
    expect(paths).toEqual(['listings[1].title']);
  });

  it('returns no paths when nothing is left as TODO', () => {
    expect(findTodoPaths({ a: 1, b: 'done', c: [true, 'fine'] })).toEqual([]);
  });
});

describe('checkLandedCostArithmetic', () => {
  it('returns null when the stored landedPrice matches the recomputed total', () => {
    expect(checkLandedCostArithmetic(baseListing)).toBeNull();
  });

  it('returns a message when the stored landedPrice does not match the components', () => {
    const broken: ResultListing = { ...baseListing, landedPrice: { minCents: 1, maxCents: 1, currency: 'USD' } };
    expect(checkLandedCostArithmetic(broken)).toMatch(/landedPrice/);
  });

  it('returns a message when landedPriceComplete disagrees with the uncertain components', () => {
    const broken: ResultListing = { ...baseListing, landedPriceComplete: false };
    expect(checkLandedCostArithmetic(broken)).toMatch(/landedPriceComplete/);
  });
});
