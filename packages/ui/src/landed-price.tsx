import type { ResultListing } from '@byb/schemas';
import { formatAmount, formatLandedPrice, formatShipping } from './lib/format-money';

/** UI §7.3 landed price block: largest text + breakdown line, ranges named honestly (CW-3). */
export function LandedPrice({
  listing,
  zip,
}: {
  listing: Pick<
    ResultListing,
    'landedPrice' | 'landedPriceComplete' | 'uncertainComponents' | 'listedPrice' | 'shippingCost' | 'estimatedTax'
  >;
  zip?: string | undefined;
}) {
  const { price, suffix, qualifier } = formatLandedPrice(listing, zip);

  return (
    <div>
      <p className="tnum text-2xl font-semibold tracking-tight">
        {price} <span className="text-base font-normal text-muted-foreground">{suffix}</span>
      </p>
      {qualifier ? <p className="text-xs text-muted-foreground">({qualifier})</p> : null}
      <p className="tnum text-xs text-muted-foreground">
        {formatAmount(listing.listedPrice)} item · {formatShipping(listing.shippingCost)} · ~
        {formatAmount(listing.estimatedTax)} tax
      </p>
    </div>
  );
}
