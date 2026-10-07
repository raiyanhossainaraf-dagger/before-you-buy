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

describe('track (M0.7 Gate 0 event set)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs page_view with a path', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    track({ name: 'page_view', props: { path: '/' } });

    expect(logSpy).toHaveBeenCalledWith('[analytics] page_view', { path: '/' });
  });

  it('logs preorder_refunded with the refunded amount', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    track({ name: 'preorder_refunded', props: { amountCents: 4_900 } });

    expect(logSpy).toHaveBeenCalledWith('[analytics] preorder_refunded', { amountCents: 4_900 });
  });

  it('rejects page_view props carrying an email or IP address (SEC-51 / TR-ANL-05)', () => {
    expect(() =>
      track({
        name: 'page_view',
        // @ts-expect-error intentionally invalid for the test — email is not a real page_view prop
        props: { path: '/', email: 'user@example.com' },
      }),
    ).toThrow();

    expect(() =>
      track({
        name: 'page_view',
        // @ts-expect-error intentionally invalid for the test — ip is not a real page_view prop
        props: { path: '/', ip: '1.2.3.4' },
      }),
    ).toThrow();
  });
});
