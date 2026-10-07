import { describe, expect, it } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('checkRateLimit (SEC-13 fixed window, M0.4)', () => {
  it('allows requests up to the limit then blocks', () => {
    const key = `test:${Math.random()}`;
    const now = 1_000_000;

    expect(checkRateLimit(key, 2, 60_000, now)).toBe(true);
    expect(checkRateLimit(key, 2, 60_000, now)).toBe(true);
    expect(checkRateLimit(key, 2, 60_000, now)).toBe(false);
  });

  it('forgets requests once the window passes', () => {
    const key = `test:${Math.random()}`;
    const now = 1_000_000;

    expect(checkRateLimit(key, 1, 60_000, now)).toBe(true);
    expect(checkRateLimit(key, 1, 60_000, now)).toBe(false);
    expect(checkRateLimit(key, 1, 60_000, now + 60_001)).toBe(true);
  });

  it('tracks separate keys independently', () => {
    const now = 2_000_000;
    expect(checkRateLimit('a', 1, 60_000, now)).toBe(true);
    expect(checkRateLimit('b', 1, 60_000, now)).toBe(true);
  });
});
