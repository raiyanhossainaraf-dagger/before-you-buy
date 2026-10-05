import { z } from 'zod';

/**
 * Server-only configuration (TRD §28). Importing this module from the browser
 * is a programming error, not a runtime fallback — rule 13 means these values
 * must never reach a client bundle, and the ESLint boundary rule plus this
 * guard are the two walls.
 */
if ('window' in globalThis) {
  throw new Error('@byb/config/server was imported in the browser.');
}

const transportEnum = z.enum(['smtp', 'resend']);
const paymentsEnum = z.enum(['mock', 'stripe']);
const analyticsEnum = z.enum(['console', 'posthog']);

const serverEnvSchema = z
  .object({
    APP_ENV: z.enum(['local', 'preview', 'production']),
    APP_DOMAIN: z.string().min(1),
    WEB_ORIGIN: z.url(),

    DATABASE_URL: z.string().min(1),
    DATABASE_URL_UNPOOLED: z.string().min(1),

    // Present from M0 so `pnpm services:up` and the compose file match M1 on,
    // though no M0 code path reads Redis yet (rate limiting is M15).
    REDIS_URL: z.string().min(1),

    TURNSTILE_SECRET_KEY: z.string().min(1),
    LINK_SIGNING_SECRET: z.string().min(32, 'LINK_SIGNING_SECRET must be ≥ 32 chars'),

    EMAIL_TRANSPORT: transportEnum,
    EMAIL_FROM: z.string().min(1),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),

    PAYMENTS_PROVIDER: paymentsEnum,
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

    ANALYTICS_TRANSPORT: analyticsEnum,
    POSTHOG_API_KEY: z.string().min(1).optional(),
  })
  // Fail at boot rather than at the moment of the first send or charge.
  .superRefine((env, ctx) => {
    if (env.EMAIL_TRANSPORT === 'smtp' && (!env.SMTP_HOST || !env.SMTP_PORT)) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_HOST'],
        message: 'SMTP_HOST and SMTP_PORT are required when EMAIL_TRANSPORT=smtp',
      });
    }
    if (env.EMAIL_TRANSPORT === 'resend' && !env.RESEND_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['RESEND_API_KEY'],
        message: 'RESEND_API_KEY is required when EMAIL_TRANSPORT=resend',
      });
    }
    if (
      env.PAYMENTS_PROVIDER === 'stripe' &&
      (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['STRIPE_SECRET_KEY'],
        message:
          'STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are required when PAYMENTS_PROVIDER=stripe',
      });
    }
    if (env.ANALYTICS_TRANSPORT === 'posthog' && !env.POSTHOG_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['POSTHOG_API_KEY'],
        message: 'POSTHOG_API_KEY is required when ANALYTICS_TRANSPORT=posthog',
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Validated once, then memoised. TRD §28 says the process exits on invalid
 * config; under Next.js a route module is evaluated per request, so we throw a
 * message naming the offending variables instead of calling process.exit.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = Object.entries(z.flattenError(parsed.error).fieldErrors)
      .map(([key, errors]) => `${key}: ${errors?.join('; ') ?? 'invalid'}`)
      .join('\n  ');
    throw new Error(`Invalid server environment:\n  ${fields}\nRun "pnpm env:local".`);
  }

  cached = parsed.data;
  return cached;
}

/** Local-only surfaces (the Gate 0 dashboard) gate on this. */
export function isLocal(): boolean {
  return serverEnv().APP_ENV === 'local';
}
