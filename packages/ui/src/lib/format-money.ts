import type { Money, MoneyRange, ResultListing } from '@byb/schemas';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}

function isRange(value: Money | MoneyRange): value is MoneyRange {
  return 'minCents' in value;
}

/** A complete range (min === max) reads as one number, not "$10–$10". */
export function formatAmount(value: Money | MoneyRange | null): string {
  if (value === null) return 'Not stated';
  if (!isRange(value)) return formatCents(value.amountCents);
  if (value.minCents === value.maxCents) return formatCents(value.minCents);
  return `${formatCents(value.minCents)}–${formatCents(value.maxCents)}`;
}

/** UI §7.3 breakdown line: "$299.99 item · Free shipping · ~$28.42 tax". */
export function formatShipping(value: Money | MoneyRange | null): string {
  if (value === null) return 'Shipping not stated';
  if (!isRange(value) && value.amountCents === 0) return 'Free shipping';
  return `${formatAmount(value)} shipping`;
}

const UNCERTAINTY_TEXT = {
  tax: 'tax depends on exact address',
  shipping: 'shipping is shown at checkout',
  both: 'shipping and tax are confirmed at checkout',
} as const;

export type LandedPriceCopy = {
  /** The large number on the card. */
  price: string;
  /** "delivered to 10001" / "delivered" — never a bare number. */
  suffix: string;
  /** Names the uncertain component; null when the total is complete. */
  qualifier: string | null;
};

/**
 * CW-3 and rule 4: landed cost is the compared number, and an incomplete total
 * is shown as a range that names what is missing — never a silent partial.
 */
export function formatLandedPrice(
  listing: Pick<
    ResultListing,
    'landedPrice' | 'landedPriceComplete' | 'uncertainComponents'
  >,
  zip?: string,
): LandedPriceCopy {
  const price = formatAmount(listing.landedPrice);

  if (listing.landedPriceComplete && listing.uncertainComponents.length === 0) {
    return {
      price,
      suffix: zip ? `delivered to ${zip}` : 'delivered',
      qualifier: null,
    };
  }

  const hasTax = listing.uncertainComponents.includes('tax');
  const hasShipping = listing.uncertainComponents.includes('shipping');
  const key = hasTax && hasShipping ? 'both' : hasShipping ? 'shipping' : 'tax';

  return { price, suffix: 'delivered', qualifier: UNCERTAINTY_TEXT[key] };
}
