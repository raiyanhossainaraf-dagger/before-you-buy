import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

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
  PAYMENTS_PROVIDER: 'mock',
  ANALYTICS_TRANSPORT: 'console',
  // .env.example leaves these empty rather than unset.
  RESEND_API_KEY: '',
  STRIPE_SECRET_KEY: '',
  STRIPE_WEBHOOK_SECRET: '',
  POSTHOG_API_KEY: '',
};

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe('serverEnv (.env.example leaves unset optional vars empty, not absent)', () => {
  it('accepts empty-string optional vars when the transport/provider does not need them', async () => {
    process.env = { ...process.env, ...BASE_ENV };

    const { serverEnv } = await import('../server');

    expect(serverEnv().RESEND_API_KEY).toBeUndefined();
    expect(serverEnv().STRIPE_SECRET_KEY).toBeUndefined();
  });

  it('still requires RESEND_API_KEY when EMAIL_TRANSPORT=resend', async () => {
    process.env = { ...process.env, ...BASE_ENV, EMAIL_TRANSPORT: 'resend' };

    const { serverEnv } = await import('../server');

    expect(() => serverEnv()).toThrow(/RESEND_API_KEY/);
  });
});
