/** TR-HIST-03 copy: ≤10 low, ≥75 high, else typical; insufficient data overrides both. */
export function historyLabel(history: {
  currentPercentile: number;
  insufficientData: boolean;
}): string {
  if (history.insufficientData) return 'Not enough history yet';
  if (history.currentPercentile <= 10) return 'Near its 90-day low';
  if (history.currentPercentile >= 75) return 'Higher than usual';
  return 'Typical price';
}
