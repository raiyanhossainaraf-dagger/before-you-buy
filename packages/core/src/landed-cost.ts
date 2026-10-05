import type { Money, MoneyRange } from '@byb/schemas';

/** Rule 3: round half-up per component (never banker's rounding). */
export function roundHalfUp(cents: number): number {
  return Math.floor(cents + 0.5);
}

function isRange(value: Money | MoneyRange): value is MoneyRange {
  return 'minCents' in value;
}

function toRange(value: Money | MoneyRange): { min: number; max: number } {
  return isRange(value) ? { min: value.minCents, max: value.maxCents } : { min: value.amountCents, max: value.amountCents };
}

export type LandedComponents = {
  listedPrice: Money;
  shippingCost: Money | MoneyRange | null;
  estimatedTax: Money | MoneyRange;
};

export type LandedCostResult = {
  landedPrice: MoneyRange;
  landedPriceComplete: boolean;
  uncertainComponents: Array<'shipping' | 'tax'>;
};

/**
 * TR-LC-01/05/06: landedPrice = listedPrice + shippingCost + estimatedTax,
 * in integer cents. Unknown shipping (null) or a tax/shipping range makes the
 * total a range and names which component is uncertain.
 */
export function computeLandedCost({
  listedPrice,
  shippingCost,
  estimatedTax,
}: LandedComponents): LandedCostResult {
  const uncertainComponents: Array<'shipping' | 'tax'> = [];

  const shipping = shippingCost === null ? { min: 0, max: 0 } : toRange(shippingCost);
  if (shippingCost === null || isRange(shippingCost)) uncertainComponents.push('shipping');

  const tax = toRange(estimatedTax);
  if (isRange(estimatedTax)) uncertainComponents.push('tax');

  return {
    landedPrice: {
      minCents: listedPrice.amountCents + shipping.min + tax.min,
      maxCents: listedPrice.amountCents + shipping.max + tax.max,
      currency: 'USD',
    },
    landedPriceComplete: uncertainComponents.length === 0,
    uncertainComponents,
  };
}
