import type { Money, MoneyRange } from '@byb/schemas';
import { computeLandedCost, roundHalfUp } from './landed-cost';

/** ZIP 10001 combined sales tax rate (state + city + MCTD) used by every demo comparison. */
const NY_COMBINED_TAX_RATE_PPM = 88750;

type RawRecord = Record<string, unknown>;

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function amountCentsOf(money: unknown): number | null {
  if (money !== null && typeof money === 'object' && isNumber((money as RawRecord).amountCents)) {
    return (money as { amountCents: number }).amountCents;
  }
  return null;
}

/**
 * NY taxes delivery charges bundled with a taxable sale, so the base is listed
 * price + known shipping. When shipping is still unknown, shippingCents is 0
 * here and the shipping itself carries the uncertainty as a separate range.
 */
export function deriveEstimatedTaxCents(listedPriceCents: number, shippingCents: number): Money {
  return {
    amountCents: roundHalfUp((listedPriceCents + shippingCents) * (NY_COMBINED_TAX_RATE_PPM / 1_000_000)),
    currency: 'USD',
  };
}

const UNKNOWN_SHIPPING_RANGE: MoneyRange = { minCents: 0, maxCents: 1099, currency: 'USD' };

/**
 * Fills estimatedTax/landedPrice/landedPriceComplete/uncertainComponents on
 * one listing from its hand-entered listedPrice/shippingCost. Leaves the
 * listing untouched when listedPrice, or a present shippingCost amount, is
 * still a "TODO" placeholder — demo:validate keeps catching those.
 */
export function deriveListing(listing: RawRecord): RawRecord {
  const listedCents = amountCentsOf(listing.listedPrice);
  const shippingRaw = listing.shippingCost;
  const shippingCents = shippingRaw === null ? 0 : amountCentsOf(shippingRaw);

  if (listedCents === null || shippingCents === null) return listing;

  const estimatedTax = deriveEstimatedTaxCents(listedCents, shippingCents);
  const shippingCost: Money | MoneyRange =
    shippingRaw === null ? UNKNOWN_SHIPPING_RANGE : { amountCents: shippingCents, currency: 'USD' };
  const landed = computeLandedCost({
    listedPrice: { amountCents: listedCents, currency: 'USD' },
    shippingCost,
    estimatedTax,
  });

  return {
    ...listing,
    shippingCost,
    estimatedTax,
    landedPrice: landed.landedPrice,
    landedPriceComplete: landed.landedPriceComplete,
    uncertainComponents: landed.uncertainComponents,
  };
}

function landedMid(listing: RawRecord): number | null {
  const landedPrice = listing.landedPrice as { minCents?: unknown; maxCents?: unknown } | undefined;
  if (!landedPrice || !isNumber(landedPrice.minCents) || !isNumber(landedPrice.maxCents)) return null;
  return (landedPrice.minCents + landedPrice.maxCents) / 2;
}

function dollars(cents: number): string {
  return (Math.abs(cents) / 100).toFixed(2);
}

const RANK_LABELS = ['Lowest delivered price', 'Best returns', 'Other option we checked'];

/**
 * Orders the new-condition listings with a known landed price by that price
 * and writes deterministic reasons. Never reads affiliate/commission data
 * (rule 6: ranking is affiliate-blind).
 */
export function deriveRankingTop(listings: RawRecord[]): RawRecord[] {
  const candidates = listings
    .filter((listing) => listing.condition === 'new' && landedMid(listing) !== null)
    .sort((a, b) => landedMid(a)! - landedMid(b)!)
    .slice(0, 3);

  if (candidates.length === 0) return [];
  const first = candidates[0]!;
  const second = candidates[1];

  return candidates.map((listing, i) => {
    const rank = i + 1;
    const mid = landedMid(listing)!;
    const reasons: Array<{ code: string; text: string }> = [];

    if (rank === 1 && second) {
      reasons.push({
        code: 'LOWER_LANDED_PRICE',
        text: `$${dollars(landedMid(second)! - mid)} less delivered than #2`,
      });
    }
    if (rank > 1) {
      reasons.push({
        code: 'HIGHER_LANDED_PRICE',
        text: `$${dollars(mid - landedMid(first)!)} more delivered than #1`,
      });
    }

    const returns = listing.returns as { windowDays?: unknown; freeReturns?: unknown } | undefined;
    const firstReturns = first.returns as { windowDays?: unknown } | undefined;
    if (rank === 2 && isNumber(returns?.windowDays) && isNumber(firstReturns?.windowDays)) {
      reasons.push({
        code: 'RETURNS_WINDOW',
        text: `${returns.windowDays}-day returns vs ${firstReturns.windowDays}`,
      });
    }
    if (returns?.freeReturns === true) {
      reasons.push({ code: 'FREE_RETURNS', text: 'Free returns' });
    }

    return { listingId: listing.listingId, rank, label: RANK_LABELS[i] ?? 'Other option we checked', reasons };
  });
}

/** ipad-base.json's refurbished alternative: saving vs the new-condition #1 pick. */
export function deriveCheaperAlternative(
  topListing: RawRecord,
  altListing: RawRecord,
): { savingCents: number; reasons: Array<{ code: string; text: string }> } | null {
  const topMid = landedMid(topListing);
  const altMid = landedMid(altListing);
  if (topMid === null || altMid === null) return null;

  const savingCents = roundHalfUp(topMid - altMid);
  const condition = String(altListing.conditionDetail ?? altListing.condition ?? 'this condition').toLowerCase();

  return {
    savingCents,
    reasons: [
      {
        code: 'CHEAPER_CONDITION_TRADEOFF',
        text: `$${dollars(savingCents)} less than the top pick, but ${condition}`,
      },
    ],
  };
}
