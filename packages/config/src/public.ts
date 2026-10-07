import { z } from 'zod';

export * from './app';

/**
 * Public configuration: safe for the client bundle. Rule 13 — nothing secret
 * may sit behind NEXT_PUBLIC_, so this schema holds only values we are happy to
 * ship to a browser.
 *
 * Each variable is read by static member access because that is the only form
 * Next.js inlines into client bundles.
 */
// .env.example leaves unset optional vars as an empty string, not absent;
// Next.js inlines that literally, so optional() (which only accepts
// undefined) needs this to tell "unset" from "set to empty" apart.
const optionalString = () => z.preprocess((v) => (v === '' ? undefined : v), z.string().min(1).optional());

const publicEnvSchema = z.strictObject({
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: optionalString(),
  NEXT_PUBLIC_POSTHOG_HOST: z.preprocess((v) => (v === '' ? undefined : v), z.url().optional()),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function readPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  if (!parsed.success) {
    // Names only — never values, so a misconfiguration cannot print a key.
    throw new Error(
      `Invalid public environment: ${Object.keys(
        z.flattenError(parsed.error).fieldErrors,
      ).join(', ')}. Run "pnpm env:local".`,
    );
  }
  return parsed.data;
}

export const publicEnv = readPublicEnv();
