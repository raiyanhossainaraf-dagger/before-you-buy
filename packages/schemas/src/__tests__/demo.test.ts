import { describe, expect, it } from 'vitest';
import { demoComparisonSchema } from '../demo';

const reviewAuthenticity = {
  score: 80,
  band: 'consistent',
  signals: [],
  reviewCount: 100,
  averageRating: 4.5,
  analyzedAt: '2026-10-01T00:00:00.000Z',
  modelVersion: 'trust-v1',
  illustrative: true,
};

const listing = {
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
  reviewAuthenticity,
  checkedAt: '2026-10-01T00:00:00.000Z',
  affiliate: { isAffiliate: false },
};

const validComparison = {
  slug: 'sony-wh-1000xm5',
  capturedAt: '2026-10-01T00:00:00.000Z',
  capturedBy: 'araf',
  product: { name: 'Sony WH-1000XM5', brand: 'Sony', category: 'headphones' },
  zip: '10001',
  listings: [listing, { ...listing, listingId: 'l2' }],
  ranking: {
    conditionScope: 'new',
    top: [{ listingId: 'l1', rank: 1, label: 'Lowest delivered price', reasons: [] }],
    excluded: [],
  },
  history: {
    basis: 'listed_new',
    platforms: ['amazon'],
    minCents: 29999,
    maxCents: 34999,
    medianCents: 31999,
    currentCents: 32841,
    currentPercentile: 40,
    daysWithData: 90,
    insufficientData: false,
    illustrative: true,
  },
};

describe('M0.3 demoComparisonSchema', () => {
  it('accepts a fully-formed demo comparison', () => {
    expect(demoComparisonSchema.safeParse(validComparison).success).toBe(true);
  });

  it('requires capturedBy', () => {
    const { capturedBy, ...rest } = validComparison;
    expect(demoComparisonSchema.safeParse(rest).success).toBe(false);
  });

  it('requires illustrative on each listing reviewAuthenticity block', () => {
    const { illustrative, ...bareTrust } = reviewAuthenticity;
    const invalid = { ...validComparison, listings: [{ ...listing, reviewAuthenticity: bareTrust }] };
    expect(demoComparisonSchema.safeParse(invalid).success).toBe(false);
  });

  it('requires illustrative on the history block', () => {
    const { illustrative, ...bareHistory } = validComparison.history;
    const invalid = { ...validComparison, history: bareHistory };
    expect(demoComparisonSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects a legacy top-level _sample flag (superseded by per-block illustrative)', () => {
    const invalid = { ...validComparison, _sample: true };
    expect(demoComparisonSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts product.image with src/alt/source/license', () => {
    const withImage = {
      ...validComparison,
      product: {
        ...validComparison.product,
        image: {
          src: '/demo/headphones.svg',
          alt: 'Illustration of over-ear headphones',
          source: 'Before You Buy illustration',
          license: 'Original artwork',
        },
      },
    };
    expect(demoComparisonSchema.safeParse(withImage).success).toBe(true);
  });

  it('omitting product.image is still valid (illustration is optional, not required)', () => {
    expect(demoComparisonSchema.safeParse(validComparison).success).toBe(true);
  });

  it('rejects product.image missing a required field', () => {
    const invalid = {
      ...validComparison,
      product: { ...validComparison.product, image: { src: '/demo/headphones.svg', alt: 'Headphones' } },
    };
    expect(demoComparisonSchema.safeParse(invalid).success).toBe(false);
  });
});
