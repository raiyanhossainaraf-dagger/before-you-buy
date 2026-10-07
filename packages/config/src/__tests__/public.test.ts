import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe('publicEnv (.env.example leaves unset optional vars empty, not absent)', () => {
  it('treats an empty NEXT_PUBLIC_POSTHOG_KEY/HOST as unset rather than invalid', async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
    process.env.NEXT_PUBLIC_POSTHOG_KEY = '';
    process.env.NEXT_PUBLIC_POSTHOG_HOST = '';

    const { publicEnv } = await import('../public');

    expect(publicEnv.NEXT_PUBLIC_POSTHOG_KEY).toBeUndefined();
    expect(publicEnv.NEXT_PUBLIC_POSTHOG_HOST).toBeUndefined();
  });

  it('still requires NEXT_PUBLIC_TURNSTILE_SITE_KEY', async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '';

    await expect(import('../public')).rejects.toThrow(/NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  });
});
