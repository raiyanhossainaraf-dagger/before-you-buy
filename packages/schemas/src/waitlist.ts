import { z } from 'zod';

/** Where the visitor came from (PRD §12.1 outreach channels). */
export const signupSourceSchema = z.enum([
  'show_hn',
  'reddit',
  'dm',
  'direct',
  'search',
  'other',
]);
export type SignupSource = z.infer<typeof signupSourceSchema>;

/** Captured for attribution; TR-ANL-05 keeps these out of analytics payloads. */
export const utmSchema = z.strictObject({
  source: z.string().max(100).optional(),
  medium: z.string().max(100).optional(),
  campaign: z.string().max(100).optional(),
  term: z.string().max(100).optional(),
  content: z.string().max(100).optional(),
});
export type Utm = z.infer<typeof utmSchema>;

/** SEC-01 / rule 1: the request boundary for POST /api/waitlist. */
export const waitlistSignupRequestSchema = z.strictObject({
  email: z.email().max(254),
  source: signupSourceSchema.default('direct'),
  utm: utmSchema.optional(),
  referrer: z.string().max(500).optional(),
  // DEC-039: the product name typed on /notify?q=, recorded only when source is 'search'.
  query: z.string().max(200).optional(),
  consent: z.literal(true, {
    error: 'Consent is required before we store an email address (LEGAL-08).',
  }),
  turnstileToken: z.string().min(1).max(2048),
});
export type WaitlistSignupRequest = z.infer<typeof waitlistSignupRequestSchema>;

/**
 * Enumeration-safe: the response never reveals whether an address was already
 * on the list (the same shape as SEC-13 requires for magic links).
 */
export const waitlistSignupResponseSchema = z.strictObject({
  ok: z.literal(true),
  message: z.string(),
});
