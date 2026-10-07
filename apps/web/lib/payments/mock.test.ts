import { afterEach, describe, expect, it, vi } from 'vitest';
import { PREORDER_OFFER } from '@byb/config';
import { signMockWebhook } from './mock-signature';

const ORIGINAL_ENV = { ...process.env };
const SECRET = 'a'.repeat(32);

const BASE_ENV = {
  APP_ENV: 'local',
  APP_DOMAIN: 'beforeyoubuy.local',
  WEB_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'postgres://byb:byb@localhost:5432/byb',
  DATABASE_URL_UNPOOLED: 'postgres://byb:byb@localhost:5432/byb',
  REDIS_URL: 'redis://localhost:6379',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  LINK_SIGNING_SECRET: SECRET,
  EMAIL_TRANSPORT: 'smtp',
  EMAIL_FROM: 'hello@beforeyoubuy.local',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  PAYMENTS_PROVIDER: 'mock',
  ANALYTICS_TRANSPORT: 'console',
  RESEND_API_KEY: '',
  STRIPE_SECRET_KEY: '',
  STRIPE_WEBHOOK_SECRET: '',
  POSTHOG_API_KEY: '',
};

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe('mock payment provider (M0.5)', () => {
  it('creates a checkout pointing at /checkout/mock with the config offer amount', async () => {
    process.env = { ...process.env, ...BASE_ENV };
    const { mockProvider } = await import('./mock');

    const { checkoutUrl, sessionId } = await mockProvider.createCheckout(
      'buyer@example.com',
      PREORDER_OFFER.code,
    );

    expect(sessionId).toMatch(/^mock_cs_/);
    const url = new URL(checkoutUrl);
    expect(url.pathname).toBe('/checkout/mock');
    expect(url.searchParams.get('amount')).toBe(String(PREORDER_OFFER.amountCents));
    expect(url.searchParams.get('offer')).toBe(PREORDER_OFFER.code);
    expect(url.searchParams.get('email')).toBe('buyer@example.com');
  });

  it('parses a correctly signed webhook body', async () => {
    process.env = { ...process.env, ...BASE_ENV };
    const { mockProvider } = await import('./mock');

    const body = JSON.stringify({
      sessionId: 'mock_cs_1',
      email: 'buyer@example.com',
      amountCents: PREORDER_OFFER.amountCents,
      offerCode: PREORDER_OFFER.code,
    });
    const headers = new Headers({ 'x-mock-signature': signMockWebhook(body, SECRET) });

    const event = await mockProvider.parseWebhook(body, headers);

    expect(event).toEqual({
      type: 'checkout_completed',
      sessionId: 'mock_cs_1',
      paymentIntentId: 'mock_pi_mock_cs_1',
      email: 'buyer@example.com',
      amountCents: PREORDER_OFFER.amountCents,
      currency: 'USD',
      offerCode: PREORDER_OFFER.code,
    });
  });

  it('rejects a webhook with an invalid signature', async () => {
    process.env = { ...process.env, ...BASE_ENV };
    const { mockProvider } = await import('./mock');

    const body = JSON.stringify({
      sessionId: 'mock_cs_1',
      email: 'buyer@example.com',
      amountCents: PREORDER_OFFER.amountCents,
      offerCode: PREORDER_OFFER.code,
    });
    const headers = new Headers({ 'x-mock-signature': signMockWebhook(body, 'b'.repeat(32)) });

    await expect(mockProvider.parseWebhook(body, headers)).rejects.toThrow(/signature/i);
  });
});
