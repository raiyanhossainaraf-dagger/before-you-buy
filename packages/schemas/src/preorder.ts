import { z } from 'zod';

/** SCHEMA §12: preorders.status. */
export const preorderStatusSchema = z.enum(['paid', 'refunded']);
export type PreorderStatus = z.infer<typeof preorderStatusSchema>;

export const preorderCheckoutRequestSchema = z.strictObject({
  email: z.email().max(254),
  turnstileToken: z.string().min(1).max(2048),
});
export type PreorderCheckoutRequest = z.infer<typeof preorderCheckoutRequestSchema>;

export const preorderCheckoutResponseSchema = z.strictObject({
  checkoutUrl: z.string().min(1),
  sessionId: z.string().min(1).max(200),
});

/**
 * The provider-agnostic event a payment webhook resolves to. Both the mock and
 * the Stripe provider produce this shape, so one handler serves both and M0.8
 * is a config change rather than a rewrite.
 */
export const paymentEventSchema = z.strictObject({
  type: z.enum(['checkout_completed', 'refunded', 'ignored']),
  sessionId: z.string().min(1).max(200),
  paymentIntentId: z.string().min(1).max(200).nullable(),
  email: z.email().max(254),
  amountCents: z.int().min(0),
  currency: z.literal('USD'),
  offerCode: z.string().min(1).max(60),
});
export type PaymentEvent = z.infer<typeof paymentEventSchema>;
