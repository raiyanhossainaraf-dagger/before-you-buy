import { describe, expect, it } from 'vitest';
import { computeLandedCost, roundHalfUp } from '../landed-cost';

describe('rule 3 half-up rounding', () => {
  it('rounds a fractional cent up at the half', () => {
    expect(roundHalfUp(12.5)).toBe(13);
  });

  it('rounds down below the half', () => {
    expect(roundHalfUp(12.49)).toBe(12);
  });

  it('rounds an already-integer value to itself', () => {
    expect(roundHalfUp(500)).toBe(500);
  });
});

describe('TR-LC-01/06 computeLandedCost — complete components', () => {
  it('sums listed price, shipping and tax in integer cents', () => {
    const result = computeLandedCost({
      listedPrice: { amountCents: 29999, currency: 'USD' },
      shippingCost: { amountCents: 0, currency: 'USD' },
      estimatedTax: { amountCents: 2842, currency: 'USD' },
    });
    expect(result.landedPrice).toEqual({ minCents: 32841, maxCents: 32841, currency: 'USD' });
    expect(result.landedPriceComplete).toBe(true);
    expect(result.uncertainComponents).toEqual([]);
  });
});

describe('TR-LC-02/05 computeLandedCost — unknown shipping', () => {
  it('reports a range and names shipping as the uncertain component when shippingCost is null', () => {
    const result = computeLandedCost({
      listedPrice: { amountCents: 10000, currency: 'USD' },
      shippingCost: null,
      estimatedTax: { amountCents: 800, currency: 'USD' },
    });
    expect(result.landedPrice).toEqual({ minCents: 10800, maxCents: 10800, currency: 'USD' });
    expect(result.landedPriceComplete).toBe(false);
    expect(result.uncertainComponents).toEqual(['shipping']);
  });
});

describe('TR-LC-03/05 computeLandedCost — tax range', () => {
  it('propagates a tax range into the landed range and names tax as uncertain', () => {
    const result = computeLandedCost({
      listedPrice: { amountCents: 10000, currency: 'USD' },
      shippingCost: { amountCents: 500, currency: 'USD' },
      estimatedTax: { minCents: 700, maxCents: 900, currency: 'USD' },
    });
    expect(result.landedPrice).toEqual({ minCents: 11200, maxCents: 11400, currency: 'USD' });
    expect(result.landedPriceComplete).toBe(false);
    expect(result.uncertainComponents).toEqual(['tax']);
  });
});

describe('computeLandedCost — both shipping and tax uncertain', () => {
  it('combines a shipping range and a tax range and names both', () => {
    const result = computeLandedCost({
      listedPrice: { amountCents: 10000, currency: 'USD' },
      shippingCost: { minCents: 0, maxCents: 1000, currency: 'USD' },
      estimatedTax: { minCents: 700, maxCents: 900, currency: 'USD' },
    });
    expect(result.landedPrice).toEqual({ minCents: 10700, maxCents: 11900, currency: 'USD' });
    expect(result.landedPriceComplete).toBe(false);
    expect(result.uncertainComponents).toEqual(['shipping', 'tax']);
  });
});
