import type { DemoComparison } from '@byb/schemas';

/**
 * e2e-only fixture: fully valid DemoComparison data (no TODOs) so Playwright
 * can prove the demo picker and ResultCard render correctly before the real
 * content/demo/*.json files are hand-filled from actual retailer checkouts.
 * Only reachable via apps/web/app/dev/demo-preview (notFound() in production).
 */
function listing(overrides: {
  listingId: string;
  platform: 'amazon' | 'ebay' | 'bestbuy';
  listedCents: number;
  shippingCents: number;
  taxCents: number;
}): DemoComparison['listings'][number] {
  const landedCents = overrides.listedCents + overrides.shippingCents + overrides.taxCents;
  return {
    listingId: overrides.listingId,
    platform: overrides.platform,
    title: 'Example Product Wireless Thing (Black)',
    condition: 'new',
    seller: { name: 'Example Seller', isRetailer: true },
    warranty: { months: 12, provider: 'manufacturer' },
    returns: { windowDays: 30, freeReturns: true },
    inStock: true,
    match: { confidence: 0.99, variant: 'exact', method: 'mpn' },
    listedPrice: { amountCents: overrides.listedCents, currency: 'USD' },
    shippingCost: { amountCents: overrides.shippingCents, currency: 'USD' },
    estimatedTax: { amountCents: overrides.taxCents, currency: 'USD' },
    landedPrice: { minCents: landedCents, maxCents: landedCents, currency: 'USD' },
    landedPriceComplete: true,
    uncertainComponents: [],
    priceVerification: { status: 'not_required' },
    reviewAuthenticity: {
      score: 76,
      band: 'consistent',
      signals: [],
      reviewCount: 500,
      averageRating: 4.5,
      analyzedAt: '2026-10-01T00:00:00.000Z',
      modelVersion: 'trust-v1-example',
      illustrative: true,
    },
    checkedAt: '2026-10-01T00:00:00.000Z',
    affiliate: { isAffiliate: false },
  };
}

function comparison(slug: string, name: string): DemoComparison {
  const listings = [
    listing({ listingId: `${slug}-amazon`, platform: 'amazon', listedCents: 29999, shippingCents: 0, taxCents: 2642 }),
    listing({ listingId: `${slug}-ebay`, platform: 'ebay', listedCents: 30999, shippingCents: 500, taxCents: 2772 }),
    listing({ listingId: `${slug}-bestbuy`, platform: 'bestbuy', listedCents: 31999, shippingCents: 0, taxCents: 2816 }),
  ];

  return {
    slug,
    capturedAt: '2026-10-01T00:00:00.000Z',
    capturedBy: 'fixture',
    product: { name, brand: 'Example', category: 'electronics' },
    zip: '10001',
    listings,
    ranking: {
      conditionScope: 'new',
      top: [
        { listingId: `${slug}-amazon`, rank: 1, label: 'Lowest delivered price', reasons: [{ code: 'CHEAPEST', text: 'Lowest delivered price of the three.' }] },
        { listingId: `${slug}-bestbuy`, rank: 2, label: 'Best returns', reasons: [{ code: 'RETURNS', text: '30-day returns.' }] },
        { listingId: `${slug}-ebay`, rank: 3, label: 'Other option we checked', reasons: [{ code: 'OTHER', text: 'In stock from a verified seller.' }] },
      ],
      excluded: [],
    },
    history: {
      basis: 'listed_new',
      platforms: ['amazon', 'ebay', 'bestbuy'],
      minCents: 27999,
      maxCents: 34999,
      medianCents: 30999,
      currentCents: 29999,
      currentPercentile: 20,
      daysWithData: 90,
      insufficientData: false,
      illustrative: true,
    },
  };
}

export const demoFixtures: DemoComparison[] = [
  comparison('fixture-one', 'Example Headphones'),
  comparison('fixture-two', 'Example Robot Vacuum'),
  comparison('fixture-three', 'Example Tablet'),
];
