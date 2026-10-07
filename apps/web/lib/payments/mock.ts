import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { serverEnv } from '@byb/config/server';
import { PREORDER_OFFER } from '@byb/config';
import { paymentEventSchema, type PaymentEvent } from '@byb/schemas/preorder';
import type { PaymentProvider } from './types';
import { verifyMockWebhookSignature } from './mock-signature';

export const MOCK_SIGNATURE_HEADER = 'x-mock-signature';

const mockWebhookBodySchema = z.strictObject({
  sessionId: z.string().min(1).max(200),
  email: z.email().max(254),
  amountCents: z.int().min(0),
  offerCode: z.string().min(1).max(60),
});

/**
 * Local-only provider (`PAYMENTS_PROVIDER=mock`): `createCheckout` points at
 * `/checkout/mock` instead of a real payment page. Its "Pay" button signs and
 * posts to the same `/api/payments/webhook` handler Stripe would hit, so that
 * handler's signature check and idempotency logic run for real.
 */
export const mockProvider: PaymentProvider = {
  async createCheckout(email, offerCode) {
    const env = serverEnv();
    const sessionId = `mock_cs_${randomUUID()}`;
    const params = new URLSearchParams({
      session: sessionId,
      email,
      offer: offerCode,
      amount: String(PREORDER_OFFER.amountCents),
    });
    return { checkoutUrl: `${env.WEB_ORIGIN}/checkout/mock?${params}`, sessionId };
  },

  async parseWebhook(rawBody, headers): Promise<PaymentEvent> {
    const signature = headers.get(MOCK_SIGNATURE_HEADER) ?? '';
    if (!verifyMockWebhookSignature(rawBody, signature, serverEnv().LINK_SIGNING_SECRET)) {
      throw new Error('Invalid mock webhook signature');
    }

    const body = mockWebhookBodySchema.parse(JSON.parse(rawBody));
    return paymentEventSchema.parse({
      type: 'checkout_completed',
      sessionId: body.sessionId,
      paymentIntentId: `mock_pi_${body.sessionId}`,
      email: body.email,
      amountCents: body.amountCents,
      currency: 'USD',
      offerCode: body.offerCode,
    });
  },
};
