import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from './analytics';

describe('track (M0.7 console adapter, used ahead of schedule by M0.4)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs a valid event by name with its props', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    track({ name: 'waitlist_signed_up', props: { source: 'direct' } });

    expect(logSpy).toHaveBeenCalledWith('[analytics] waitlist_signed_up', { source: 'direct' });
  });

  it('rejects an event that is not in the TR-ANL-02 schema', () => {
    expect(() =>
      // @ts-expect-error intentionally invalid for the test
      track({ name: 'not_a_real_event', props: {} }),
    ).toThrow();
  });
});
