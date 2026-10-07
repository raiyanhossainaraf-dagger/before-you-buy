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

/** Zero or missing both mean "no returns" for ranking purposes — never a favorable value. */
function returnsDaysOrZero(listing: RawRecord): number {
  const windowDays = (listing.returns as { windowDays?: unknown } | undefined)?.windowDays;
  return isNumber(windowDays) && windowDays > 0 ? windowDays : 0;
}

function warrantyMonthsOrZero(listing: RawRecord): number {
  const months = (listing.warranty as { months?: unknown } | undefined)?.months;
  return isNumber(months) && months > 0 ? months : 0;
}

/** Official retailers (`isRetailer: true`) sort ahead of marketplace sellers as a last-resort tiebreaker. */
function sellerRetailerRank(listing: RawRecord): number {
  return (listing.seller as { isRetailer?: unknown } | undefined)?.isRetailer === true ? 0 : 1;
}

function sellerName(listing: RawRecord): string {
  const name = (listing.seller as { name?: unknown } | undefined)?.name;
  return typeof name === 'string' ? name : '';
}

/** Ties are same price or within $3 / 2%, whichever is larger — never a "$0.00 difference" claim. */
function isLandedPriceTie(aMid: number, bMid: number): boolean {
  const threshold = Math.max(300, Math.round(0.02 * Math.min(aMid, bMid)));
  return Math.abs(aMid - bMid) <= threshold;
}

/** price, then (on a tie) returns, then warranty, then seller — fully deterministic. */
function compareCandidates(a: RawRecord, b: RawRecord): number {
  const aMid = landedMid(a)!;
  const bMid = landedMid(b)!;
  if (!isLandedPriceTie(aMid, bMid)) return aMid - bMid;

  const returnsDiff = returnsDaysOrZero(b) - returnsDaysOrZero(a);
  if (returnsDiff !== 0) return returnsDiff;

  const warrantyDiff = warrantyMonthsOrZero(b) - warrantyMonthsOrZero(a);
  if (warrantyDiff !== 0) return warrantyDiff;

  const retailerDiff = sellerRetailerRank(a) - sellerRetailerRank(b);
  if (retailerDiff !== 0) return retailerDiff;

  return sellerName(a).localeCompare(sellerName(b));
}

function returnsPhrase(days: number, withWord: boolean): string {
  if (days <= 0) return 'No returns';
  return withWord ? `${days}-day returns` : `${days}-day`;
}

/** "No returns" replaces any zero side — never "0-day" (demo:validate-adjacent honesty rule). */
export function formatReturnsComparison(subjectDays: number, otherDays: number): string {
  return `${returnsPhrase(subjectDays, true)} vs ${returnsPhrase(otherDays, false)}`;
}

const OTHER_OPTION_LABEL = 'Other option we checked';

/**
 * Orders the new-condition listings with a known landed price by that price
 * (ties broken by returns, then warranty, then seller) and writes
 * deterministic reasons. Never reads affiliate/commission data (rule 6:
 * ranking is affiliate-blind). "Best returns" only ever goes to the listing
 * that genuinely has the longest return window (and it must be > 0 days) —
 * never a fixed position.
 */
export function deriveRankingTop(listings: RawRecord[]): RawRecord[] {
  const candidates = listings
    .filter((listing) => listing.condition === 'new' && landedMid(listing) !== null)
    .sort(compareCandidates)
    .slice(0, 3);

  if (candidates.length === 0) return [];
  const first = candidates[0]!;
  const firstReturnsDays = returnsDaysOrZero(first);

  const others = candidates.slice(1);
  const bestOthersReturnsDays = others.length > 0 ? Math.max(...others.map(returnsDaysOrZero)) : 0;
  // "Best returns" must genuinely beat the #1 pick, not merely tie it — a tie says nothing distinctive.
  const bestReturnsId =
    bestOthersReturnsDays > firstReturnsDays && bestOthersReturnsDays > 0
      ? others.find((listing) => returnsDaysOrZero(listing) === bestOthersReturnsDays)?.listingId
      : undefined;

  return candidates.map((listing, i) => {
    const rank = i + 1;
    const mid = landedMid(listing)!;
    const reasons: Array<{ code: string; text: string }> = [];

    if (i === 0) {
      const second = candidates[1];
      if (second) {
        const secondMid = landedMid(second)!;
        reasons.push(
          isLandedPriceTie(mid, secondMid)
            ? { code: 'SAME_LANDED_PRICE', text: 'Same delivered price as #2' }
            : { code: 'LOWER_LANDED_PRICE', text: `$${dollars(secondMid - mid)} less delivered than #2` },
        );
      }
    } else {
      const firstMid = landedMid(first)!;
      reasons.push(
        isLandedPriceTie(mid, firstMid)
          ? { code: 'SAME_LANDED_PRICE', text: 'Same delivered price as #1' }
          : { code: 'HIGHER_LANDED_PRICE', text: `$${dollars(mid - firstMid)} more delivered than #1` },
      );
    }

    if (listing.listingId === bestReturnsId) {
      reasons.push({
        code: 'RETURNS_WINDOW',
        text: formatReturnsComparison(returnsDaysOrZero(listing), returnsDaysOrZero(first)),
      });
    }

    const freeReturns = (listing.returns as { freeReturns?: unknown } | undefined)?.freeReturns;
    if (freeReturns === true) {
      reasons.push({ code: 'FREE_RETURNS', text: 'Free returns' });
    }

    const label =
      i === 0 ? 'Lowest delivered price' : listing.listingId === bestReturnsId ? 'Best returns' : OTHER_OPTION_LABEL;

    return { listingId: listing.listingId, rank, label, reasons };
  });
}

/**
 * ipad-base.json's refurbished alternative: saving vs the new-condition #1
 * pick. Returns null (no cheaper alternative to show) when the computed
 * saving isn't positive — rule 4 forbids presenting a misleading number.
 */
export function deriveCheaperAlternative(
  topListing: RawRecord,
  altListing: RawRecord,
): { savingCents: number; reasons: Array<{ code: string; text: string }> } | null {
  const topMid = landedMid(topListing);
  const altMid = landedMid(altListing);
  if (topMid === null || altMid === null) return null;

  const savingCents = roundHalfUp(topMid - altMid);
  if (savingCents <= 0) return null;
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
