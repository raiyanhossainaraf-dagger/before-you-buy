import { afterEach, describe, expect, it, vi } from 'vitest';
import Stripe from 'stripe';

const ORIGINAL_ENV = { ...process.env };
const WEBHOOK_SECRET = 'whsec_test_secret';

const BASE_ENV = {
  APP_ENV: 'local',
  APP_DOMAIN: 'beforeyoubuy.local',
  WEB_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'postgres://byb:byb@localhost:5432/byb',
  DATABASE_URL_UNPOOLED: 'postgres://byb:byb@localhost:5432/byb',
  REDIS_URL: 'redis://localhost:6379',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  LINK_SIGNING_SECRET: 'a'.repeat(32),
  EMAIL_TRANSPORT: 'smtp',
  EMAIL_FROM: 'hello@beforeyoubuy.local',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  PAYMENTS_PROVIDER: 'stripe',
  STRIPE_SECRET_KEY: 'sk_test_fake',
  STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
  ANALYTICS_TRANSPORT: 'console',
  RESEND_API_KEY: '',
  POSTHOG_API_KEY: '',
};

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

/** TR-BILL-07 / SEC-70: verified entirely offline via Stripe's test-signature helper. */
describe('stripe payment provider (M0.5, written but unused)', () => {
  it('parses a checkout.session.completed event with a valid signature', async () => {
    process.env = { ...process.env, ...BASE_ENV };
    const { stripeProvider } = await import('./stripe');

    const payload = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_test_123',
          customer_email: 'buyer@example.com',
          amount_total: 4_900,
          metadata: { offerCode: 'starter_3mo_launch' },
        },
      },
    });
    const header = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
    });

    const event = await stripeProvider.parseWebhook(payload, new Headers({ 'stripe-signature': header }));

    expect(event).toEqual({
      type: 'checkout_completed',
      sessionId: 'cs_test_123',
      paymentIntentId: 'pi_test_123',
      email: 'buyer@example.com',
      amountCents: 4_900,
      currency: 'USD',
      offerCode: 'starter_3mo_launch',
    });
  });

  it('rejects a webhook with an invalid signature', async () => {
    process.env = { ...process.env, ...BASE_ENV };
    const { stripeProvider } = await import('./stripe');

    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });

    await expect(
      stripeProvider.parseWebhook(payload, new Headers({ 'stripe-signature': 't=1,v1=invalid' })),
    ).rejects.toThrow();
  });

  it('ignores event types it does not act on', async () => {
    process.env = { ...process.env, ...BASE_ENV };
    const { stripeProvider } = await import('./stripe');

    const payload = JSON.stringify({ id: 'evt_2', type: 'charge.refunded', data: { object: {} } });
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });

    const event = await stripeProvider.parseWebhook(payload, new Headers({ 'stripe-signature': header }));

    expect(event.type).toBe('ignored');
  });
});
