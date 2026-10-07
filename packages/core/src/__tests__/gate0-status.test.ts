import { describe, expect, it } from 'vitest';
import { gate0Status } from '../gate0-status';

/** PRD §12.1 thresholds: proceed / reconsider / not enough data yet. */
describe('gate0Status', () => {
  it('returns proceed at or above the proceed threshold', () => {
    expect(gate0Status(100, { proceedAt: 100, reconsiderBelow: 30 })).toBe('proceed');
    expect(gate0Status(150, { proceedAt: 100, reconsiderBelow: 30 })).toBe('proceed');
  });

  it('returns reconsider below the reconsider threshold', () => {
    expect(gate0Status(29, { proceedAt: 100, reconsiderBelow: 30 })).toBe('reconsider');
    expect(gate0Status(0, { proceedAt: 100, reconsiderBelow: 30 })).toBe('reconsider');
  });

  it('returns not_enough_data between the two thresholds', () => {
    expect(gate0Status(30, { proceedAt: 100, reconsiderBelow: 30 })).toBe('not_enough_data');
    expect(gate0Status(99, { proceedAt: 100, reconsiderBelow: 30 })).toBe('not_enough_data');
  });

  it('treats exactly 0 as reconsider for the pre-order threshold (10+ proceed, 0 reconsider)', () => {
    expect(gate0Status(0, { proceedAt: 10, reconsiderBelow: 1 })).toBe('reconsider');
    expect(gate0Status(5, { proceedAt: 10, reconsiderBelow: 1 })).toBe('not_enough_data');
    expect(gate0Status(10, { proceedAt: 10, reconsiderBelow: 1 })).toBe('proceed');
  });
});
