import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatCents,
  formatLandedPrice,
  formatShipping,
} from '../format-money';

const usd = { currency: 'USD' } as const;

describe('formatAmount', () => {
  it('formats an exact amount', () => {
    expect(formatCents(32_841)).toBe('$328.41');
  });

  it('collapses a complete range to one number', () => {
    expect(formatAmount({ minCents: 500, maxCents: 500, ...usd })).toBe('$5.00');
  });

  it('renders an open range with an en dash', () => {
    expect(formatAmount({ minCents: 31_200, maxCents: 32_700, ...usd })).toBe(
      '$312.00–$327.00',
    );
  });

  it('says so when a component is unknown rather than showing nothing', () => {
    expect(formatAmount(null)).toBe('Not stated');
  });
});

describe('formatShipping', () => {
  it('calls zero shipping free', () => {
    expect(formatShipping({ amountCents: 0, ...usd })).toBe('Free shipping');
  });

  it('never silently omits unknown shipping', () => {
    expect(formatShipping(null)).toBe('Shipping not stated');
  });
});

describe('formatLandedPrice — CW-3 / rule 4', () => {
  it('names the ZIP when the total is complete', () => {
    const copy = formatLandedPrice(
      {
        landedPrice: { minCents: 32_841, maxCents: 32_841, ...usd },
        landedPriceComplete: true,
        uncertainComponents: [],
      },
      '10001',
    );
    expect(copy.price).toBe('$328.41');
    expect(copy.suffix).toBe('delivered to 10001');
    expect(copy.qualifier).toBeNull();
  });

  it('names tax as the uncertain component', () => {
    const copy = formatLandedPrice({
      landedPrice: { minCents: 31_200, maxCents: 32_700, ...usd },
      landedPriceComplete: false,
      uncertainComponents: ['tax'],
    });
    expect(copy.price).toBe('$312.00–$327.00');
    expect(copy.qualifier).toBe('tax depends on exact address');
  });

  it('names shipping as the uncertain component', () => {
    const copy = formatLandedPrice({
      landedPrice: { minCents: 10_000, maxCents: 12_000, ...usd },
      landedPriceComplete: false,
      uncertainComponents: ['shipping'],
    });
    expect(copy.qualifier).toBe('shipping is shown at checkout');
  });

  it('covers both components at once', () => {
    const copy = formatLandedPrice({
      landedPrice: { minCents: 10_000, maxCents: 14_000, ...usd },
      landedPriceComplete: false,
      uncertainComponents: ['shipping', 'tax'],
    });
    expect(copy.qualifier).toBe('shipping and tax are confirmed at checkout');
  });

  it('never returns a bare number without a qualifier when incomplete', () => {
    const copy = formatLandedPrice({
      landedPrice: { minCents: 1, maxCents: 2, ...usd },
      landedPriceComplete: false,
      uncertainComponents: ['tax'],
    });
    expect(copy.qualifier).not.toBeNull();
  });
});
