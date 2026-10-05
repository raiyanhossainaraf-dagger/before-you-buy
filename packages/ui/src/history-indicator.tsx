import { historyLabel } from '@byb/core';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { PriceHistory90d } from '@byb/schemas';
import { cn } from './lib/cn';

/** Keyed by historyLabel's copy so the icon/color never drifts from the text (TR-HIST-03). */
const BY_LABEL = {
  'Near its 90-day low': { Icon: TrendingDown, className: 'text-trust-good' },
  'Higher than usual': { Icon: TrendingUp, className: 'text-trust-poor' },
  'Typical price': { Icon: Minus, className: 'text-trust-mixed' },
  'Not enough history yet': { Icon: Minus, className: 'text-trust-unknown' },
} as const;

/** UI §7.6: inline 90-day history indicator ("Near its 90-day low", …). */
export function HistoryIndicator({
  history,
  illustrative,
}: {
  history: Pick<PriceHistory90d, 'currentPercentile' | 'insufficientData'>;
  illustrative?: boolean | undefined;
}) {
  const label = historyLabel(history);
  const { Icon, className } = BY_LABEL[label as keyof typeof BY_LABEL];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{label}</span>
      {illustrative ? <span className="text-xs text-muted-foreground">(Example analysis)</span> : null}
    </span>
  );
}
