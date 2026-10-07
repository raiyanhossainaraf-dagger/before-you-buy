import { describe, expect, it } from 'vitest';
import {
  deriveCheaperAlternative,
  deriveEstimatedTaxCents,
  deriveListing,
  deriveRankingTop,
  formatReturnsComparison,
} from '../demo-derive';

describe('deriveEstimatedTaxCents — NY ZIP 10001, 8.875% on price + shipping', () => {
  it('taxes listed price and shipping together, rounded half-up', () => {
    expect(deriveEstimatedTaxCents(29999, 0)).toEqual({ amountCents: 2662, currency: 'USD' });
    expect(deriveEstimatedTaxCents(10000, 500)).toEqual({ amountCents: 932, currency: 'USD' });
  });
});

describe('deriveListing', () => {
  it('fills tax and landed cost from a known listedPrice/shippingCost', () => {
    const result = deriveListing({
      listingId: 'a',
      condition: 'new',
      listedPrice: { amountCents: 29999, currency: 'USD' },
      shippingCost: { amountCents: 0, currency: 'USD' },
    });
    expect(result.estimatedTax).toEqual({ amountCents: 2662, currency: 'USD' });
    expect(result.landedPrice).toEqual({ minCents: 32661, maxCents: 32661, currency: 'USD' });
    expect(result.landedPriceComplete).toBe(true);
    expect(result.uncertainComponents).toEqual([]);
  });

  it('uses a 0-1099 cent shipping range and flags it uncertain when shipping is null', () => {
    const result = deriveListing({
      listingId: 'a',
      condition: 'new',
      listedPrice: { amountCents: 10000, currency: 'USD' },
      shippingCost: null,
    });
    expect(result.shippingCost).toEqual({ minCents: 0, maxCents: 1099, currency: 'USD' });
    expect(result.estimatedTax).toEqual({ amountCents: 888, currency: 'USD' });
    expect(result.landedPrice).toEqual({ minCents: 10888, maxCents: 11987, currency: 'USD' });
    expect(result.landedPriceComplete).toBe(false);
    expect(result.uncertainComponents).toEqual(['shipping']);
  });

  it('leaves the listing untouched when listedPrice is still a TODO placeholder', () => {
    const listing = {
      listingId: 'a',
      condition: 'new',
      listedPrice: { amountCents: 'TODO', currency: 'USD' },
      shippingCost: { amountCents: 'TODO', currency: 'USD' },
    };
    expect(deriveListing(listing)).toEqual(listing);
  });
});

describe('formatReturnsComparison', () => {
  it('renders a zero-day side as "No returns", never "0-day"', () => {
    expect(formatReturnsComparison(0, 30)).toBe('No returns vs 30-day');
    expect(formatReturnsComparison(30, 0)).toBe('30-day returns vs No returns');
  });

  it('renders two non-zero sides as "{n}-day returns vs {n}-day"', () => {
    expect(formatReturnsComparison(60, 30)).toBe('60-day returns vs 30-day');
  });
});

describe('deriveRankingTop', () => {
  const listing = (id: string, landedCents: number, extra: Record<string, unknown> = {}) => ({
    listingId: id,
    condition: 'new',
    landedPrice: { minCents: landedCents, maxCents: landedCents, currency: 'USD' },
    returns: { windowDays: 30, freeReturns: false },
    seller: { name: 'Seller', isRetailer: false },
    ...extra,
  });

  it('orders new-condition listings by landed price and generates price/returns reasons', () => {
    const top = deriveRankingTop([
      listing('cheap', 30000),
      listing('mid', 32000, { returns: { windowDays: 60, freeReturns: false } }),
      listing('expensive', 35000),
    ]);

    expect(top.map((t) => t.listingId)).toEqual(['cheap', 'mid', 'expensive']);
    expect(top[0]).toMatchObject({
      rank: 1,
      label: 'Lowest delivered price',
      reasons: [{ code: 'LOWER_LANDED_PRICE', text: '$20.00 less delivered than #2' }],
    });
    expect(top[1]).toMatchObject({ label: 'Best returns' });
    expect(top[1]!.reasons).toContainEqual({ code: 'RETURNS_WINDOW', text: '60-day returns vs 30-day' });
    expect(top[2]).toMatchObject({
      rank: 3,
      label: 'Other option we checked',
      reasons: [{ code: 'HIGHER_LANDED_PRICE', text: '$50.00 more delivered than #1' }],
    });
  });

  it('ignores non-new and not-yet-computed listings', () => {
    const top = deriveRankingTop([
      listing('used', 10000, { condition: 'used' }),
      { listingId: 'todo', condition: 'new', landedPrice: { minCents: 'TODO', maxCents: 'TODO' } },
    ]);
    expect(top).toEqual([]);
  });

  it('treats landed prices within $3 (or 2%) as a tie: no "$0.00" reason, "Same delivered price" instead', () => {
    const top = deriveRankingTop([
      listing('a', 30000, { returns: { windowDays: 15, freeReturns: false } }),
      listing('b', 30299, { returns: { windowDays: 15, freeReturns: false } }),
      listing('c', 40000),
    ]);

    const [first, second] = top;
    expect(first!.reasons).toContainEqual({ code: 'SAME_LANDED_PRICE', text: 'Same delivered price as #2' });
    expect(second!.reasons).toContainEqual({ code: 'SAME_LANDED_PRICE', text: 'Same delivered price as #1' });
    const reasons = [
      ...(first!.reasons as Array<{ text: string }>),
      ...(second!.reasons as Array<{ text: string }>),
    ];
    for (const reason of reasons) {
      expect(reason.text).not.toContain('$0.00');
    }
  });

  it('exact price ties are broken by returns, then warranty, then seller, so the more favorable one ranks first', () => {
    const top = deriveRankingTop([
      listing('worse-returns', 30000, {
        returns: { windowDays: 15, freeReturns: false },
        seller: { name: 'Zed', isRetailer: false },
      }),
      listing('better-returns', 30000, {
        returns: { windowDays: 45, freeReturns: false },
        seller: { name: 'Acme', isRetailer: false },
      }),
    ]);

    expect(top.map((t) => t.listingId)).toEqual(['better-returns', 'worse-returns']);
  });

  it('"Best returns" only goes to the listing with the genuinely longest return window', () => {
    const top = deriveRankingTop([
      listing('cheapest', 30000, { returns: { windowDays: 10, freeReturns: false } }),
      listing('mid', 32000, { returns: { windowDays: 10, freeReturns: false } }),
      listing('priciest', 40000, { returns: { windowDays: 90, freeReturns: false } }),
    ]);

    const byId = Object.fromEntries(top.map((t) => [t.listingId, t]));
    expect(byId.priciest).toMatchObject({ label: 'Best returns' });
    expect(byId.mid).toMatchObject({ label: 'Other option we checked' });
  });

  it('never labels a listing "Best returns" when its window only ties the #1 pick, never beats it', () => {
    const top = deriveRankingTop([
      listing('cheapest', 30000, { returns: { windowDays: 15, freeReturns: false } }),
      listing('tied-returns', 32000, { returns: { windowDays: 15, freeReturns: false } }),
      listing('no-returns', 34000, { returns: { windowDays: 0, freeReturns: false } }),
    ]);

    for (const entry of top) {
      expect(entry.label).not.toBe('Best returns');
    }
    const tied = top.find((t) => t.listingId === 'tied-returns')!;
    const tiedReasons = tied.reasons as Array<{ code: string }>;
    expect(tiedReasons.find((r) => r.code === 'RETURNS_WINDOW')).toBeUndefined();
  });

  it('a listing with no returns (0 or null) can never be labeled "Best returns"', () => {
    const top = deriveRankingTop([
      listing('cheap', 30000, { returns: { windowDays: 0, freeReturns: false } }),
      listing('mid', 32000, { returns: { windowDays: 0, freeReturns: false } }),
      listing('expensive', 35000, { returns: { windowDays: null, freeReturns: false } }),
    ]);

    for (const entry of top) {
      expect(entry.label).not.toBe('Best returns');
    }
  });
});

describe('deriveCheaperAlternative', () => {
  it('computes the saving and a reason naming the tradeoff', () => {
    const top = { landedPrice: { minCents: 34900, maxCents: 34900, currency: 'USD' } };
    const alt = {
      condition: 'refurbished',
      conditionDetail: 'Renewed',
      landedPrice: { minCents: 29900, maxCents: 29900, currency: 'USD' },
    };
    expect(deriveCheaperAlternative(top, alt)).toEqual({
      savingCents: 5000,
      reasons: [{ code: 'CHEAPER_CONDITION_TRADEOFF', text: '$50.00 less than the top pick, but renewed' }],
    });
  });

  it('returns null when the "alternative" is not actually cheaper (rule 4: never show a misleading number)', () => {
    const top = { landedPrice: { minCents: 43441, maxCents: 43441, currency: 'USD' } };
    const alt = {
      condition: 'refurbished',
      conditionDetail: 'Renewed',
      landedPrice: { minCents: 44638, maxCents: 44638, currency: 'USD' },
    };
    expect(deriveCheaperAlternative(top, alt)).toBeNull();
  });
});
