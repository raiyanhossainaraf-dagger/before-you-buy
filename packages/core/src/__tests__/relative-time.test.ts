import { describe, expect, it } from 'vitest';
import { formatCheckedAgo } from '../relative-time';

const now = new Date('2026-10-05T12:00:00.000Z');

describe('formatCheckedAgo (UI §9.2: "Checked 3 minutes ago", never a raw timestamp)', () => {
  it('says "just now" for under a minute', () => {
    expect(formatCheckedAgo('2026-10-05T11:59:40.000Z', now)).toBe('Checked just now');
  });

  it('says minutes ago for under an hour', () => {
    expect(formatCheckedAgo('2026-10-05T11:57:00.000Z', now)).toBe('Checked 3 minutes ago');
  });

  it('uses singular minute for exactly one minute', () => {
    expect(formatCheckedAgo('2026-10-05T11:59:00.000Z', now)).toBe('Checked 1 minute ago');
  });

  it('says hours ago for under a day', () => {
    expect(formatCheckedAgo('2026-10-05T09:00:00.000Z', now)).toBe('Checked 3 hours ago');
  });

  it('says days ago beyond a day', () => {
    expect(formatCheckedAgo('2026-10-03T12:00:00.000Z', now)).toBe('Checked 2 days ago');
  });
});
