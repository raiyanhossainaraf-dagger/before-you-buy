import { formatCheckedAgo } from '@byb/core';
import type { PriceHistory90d, ResultListing } from '@byb/schemas';
import { CONDITION_LABELS, PLATFORM_LABELS } from '@byb/schemas';
import { cn } from './lib/cn';
import { LandedPrice } from './landed-price';
import { ReasonList } from './reason-list';
import { TrustBadge } from './trust-badge';
import { HistoryIndicator } from './history-indicator';

/** UI §7.3 Result card — all states, no retailer image (LEGAL-16: neutral placeholder only). */
export function ResultCard({
  listing,
  rank,
  label,
  reasons = [],
  zip,
  history,
  illustrativeHistory,
  illustrativeTrust,
  now = new Date(),
}: {
  listing: ResultListing;
  rank?: 1 | 2 | 3 | undefined;
  label?: string | undefined;
  reasons?: Array<{ code: string; text: string }>;
  zip?: string | undefined;
  history: Pick<PriceHistory90d, 'currentPercentile' | 'insufficientData'>;
  illustrativeHistory?: boolean | undefined;
  illustrativeTrust?: boolean | undefined;
  now?: Date;
}) {
  const isPossibleMatch = listing.match.variant === 'unknown' || listing.match.confidence < 0.8;
  const conditionBadgeClass =
    listing.condition === 'new' ? 'bg-muted text-foreground' : 'bg-trust-mixed-bg text-trust-mixed';

  return (
    <article
      data-listing-id={listing.listingId}
      data-condition={listing.condition}
      className={cn(
        'rounded-card border bg-card p-4 shadow-sm',
        isPossibleMatch ? 'border-trust-mixed' : 'border-border',
      )}
    >
      {rank ? (
        <p className="text-xs font-medium text-muted-foreground">
          #{rank}
          {label ? ` · ${label}` : ''}
        </p>
      ) : null}

      <div className="mt-1 flex items-center gap-3">
        <div aria-hidden className="size-14 shrink-0 rounded-control bg-muted" />
        <div>
          <p className="text-xs text-muted-foreground">
            {PLATFORM_LABELS[listing.platform]} ·{' '}
            <span className={cn('rounded-full px-1.5 py-0.5', conditionBadgeClass)}>
              {CONDITION_LABELS[listing.condition]}
              {listing.conditionDetail ? ` — ${listing.conditionDetail}` : ''}
            </span>{' '}
            · Sold by {listing.seller.name}
          </p>
          <h3 className="line-clamp-2 text-sm font-medium">{listing.title}</h3>
        </div>
      </div>

      {isPossibleMatch ? (
        <p className="mt-2 text-xs text-trust-mixed">
          Possible match — check the model and color before buying.
        </p>
      ) : null}

      <div className="mt-3">
        <LandedPrice listing={listing} zip={zip} />
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <TrustBadge trust={listing.reviewAuthenticity} illustrative={illustrativeTrust} />
        <div>
          <HistoryIndicator history={history} illustrative={illustrativeHistory} />
        </div>
        <p className="text-xs text-muted-foreground">
          {listing.returns.windowDays !== null ? `${listing.returns.windowDays}-day returns` : 'Returns not stated'}
          {' · '}
          {listing.warranty.months !== null
            ? `${listing.warranty.months}-month ${listing.warranty.provider} warranty`
            : 'Warranty not stated'}
        </p>
      </div>

      {reasons.length > 0 ? (
        <div className="mt-3">
          <ReasonList reasons={reasons} label={rank ? `Why #${rank}` : undefined} />
        </div>
      ) : null}

      <div className="mt-4">
        {listing.outboundUrl ? (
          <a
            href={listing.outboundUrl}
            className="flex min-h-11 w-full items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            View on {PLATFORM_LABELS[listing.platform]}
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled
            className="flex min-h-11 w-full items-center justify-center rounded-control border border-border px-4 text-sm text-muted-foreground"
          >
            Links available at launch
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {listing.affiliate.isAffiliate ? 'Affiliate link · ' : ''}
        {formatCheckedAgo(listing.checkedAt, now)}
        {listing.priceVerification.status === 'verified' ? ' · Price verified' : ''}
        {listing.attribution ? ` · ${listing.attribution.text}` : ''}
      </p>
    </article>
  );
}
