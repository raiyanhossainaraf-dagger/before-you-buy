import { describe, expect, it } from 'vitest';
import { historyLabel } from '../history-label';

describe('TR-HIST-03 historyLabel', () => {
  it('reads "Near its 90-day low" at or below the 10th percentile', () => {
    expect(historyLabel({ currentPercentile: 10, insufficientData: false })).toBe(
      'Near its 90-day low',
    );
  });

  it('reads "Higher than usual" at or above the 75th percentile', () => {
    expect(historyLabel({ currentPercentile: 75, insufficientData: false })).toBe(
      'Higher than usual',
    );
  });

  it('reads "Typical price" in between', () => {
    expect(historyLabel({ currentPercentile: 40, insufficientData: false })).toBe(
      'Typical price',
    );
  });

  it('reads "Not enough history yet" when data is insufficient, regardless of percentile', () => {
    expect(historyLabel({ currentPercentile: 5, insufficientData: true })).toBe(
      'Not enough history yet',
    );
  });
});
