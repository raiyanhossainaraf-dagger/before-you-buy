export type Gate0Status = 'proceed' | 'reconsider' | 'not_enough_data';

/** PRD §12.1 Gate 0 thresholds: proceed at/above, reconsider below, otherwise not enough data yet. */
export function gate0Status(
  count: number,
  thresholds: { proceedAt: number; reconsiderBelow: number },
): Gate0Status {
  if (count >= thresholds.proceedAt) return 'proceed';
  if (count < thresholds.reconsiderBelow) return 'reconsider';
  return 'not_enough_data';
}
