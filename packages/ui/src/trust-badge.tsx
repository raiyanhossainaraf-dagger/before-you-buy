import { CircleAlert, CircleCheck, CircleHelp, TriangleAlert } from 'lucide-react';
import type { ReviewAuthenticity, TrustBand } from '@byb/schemas';
import { TRUST_BAND_LABELS } from '@byb/schemas';
import { cn } from './lib/cn';
import { Sheet } from './sheet';

const BAND_ICON: Record<TrustBand, typeof CircleCheck> = {
  consistent: CircleCheck,
  some_concerns: CircleAlert,
  strong_concerns: TriangleAlert,
  insufficient_data: CircleHelp,
};

const BAND_CLASS: Record<TrustBand, string> = {
  consistent: 'text-trust-good',
  some_concerns: 'text-trust-mixed',
  strong_concerns: 'text-trust-poor',
  insufficient_data: 'text-trust-unknown',
};

/** UI §7.3/§7.5: band icon + label opens the trust signals sheet (CW-6). */
export function TrustBadge({
  trust,
  illustrative,
}: {
  trust: ReviewAuthenticity;
  illustrative?: boolean | undefined;
}) {
  const Icon = BAND_ICON[trust.band];
  const label = TRUST_BAND_LABELS[trust.band];

  return (
    <Sheet
      title="Review authenticity"
      trigger={
        <span className="flex flex-col items-start gap-0.5">
          <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', BAND_CLASS[trust.band])}>
            <Icon aria-hidden className="size-4 shrink-0" />
            <span>{label}</span>
          </span>
          {illustrative ? <span className="text-xs text-muted-foreground">(Example analysis)</span> : null}
        </span>
      }
    >
      {illustrative ? (
        <p className="rounded-control bg-muted px-3 py-2 text-xs text-muted-foreground">
          Example analysis — illustrative figures, not pulled from live reviews.
        </p>
      ) : null}
      <p>
        {trust.score !== null ? `${trust.score}/100 · ` : ''}
        {trust.reviewCount !== null
          ? `Based on ${trust.reviewCount.toLocaleString('en-US')} reviews`
          : 'Not enough reviews to judge (fewer than 20).'}
      </p>
      <ul className="space-y-2">
        {trust.signals.slice(0, 6).map((signal) => (
          <li key={signal.code} className="flex items-start gap-2">
            {signal.effect === 'lowers' ? (
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-trust-mixed" />
            ) : (
              <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-trust-good" />
            )}
            <span>{signal.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        These are patterns, not proof. How trust scores work &rsaquo;
      </p>
    </Sheet>
  );
}
