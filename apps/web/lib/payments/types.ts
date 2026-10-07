import type { PaymentEvent } from '@byb/schemas/preorder';

/**
 * M0.5: one interface, two implementations (mock local / stripe real but
 * unused), so M0.8 swapping `PAYMENTS_PROVIDER` is a config change, not a
 * rewrite — the same pattern as `@byb/email`'s transport switch.
 */
export interface PaymentProvider {
  createCheckout(
    email: string,
    offerCode: string,
  ): Promise<{ checkoutUrl: string; sessionId: string }>;
  parseWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent>;
}
