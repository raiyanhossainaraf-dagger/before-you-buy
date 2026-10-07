import { describe, expect, it } from 'vitest';
import {
  deriveCheaperAlternative,
  deriveEstimatedTaxCents,
  deriveListing,
  deriveRankingTop,
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

describe('deriveRankingTop', () => {
  const listing = (id: string, landedCents: number, extra: Record<string, unknown> = {}) => ({
    listingId: id,
    condition: 'new',
    landedPrice: { minCents: landedCents, maxCents: landedCents, currency: 'USD' },
    returns: { windowDays: 30, freeReturns: false },
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
    expect(top[1]!.reasons).toContainEqual({ code: 'RETURNS_WINDOW', text: '60-day returns vs 30' });
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
});
