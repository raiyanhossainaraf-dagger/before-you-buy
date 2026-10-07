import Stripe from 'stripe';
import { serverEnv } from '@byb/config/server';
import { PREORDER_OFFER } from '@byb/config';
import { paymentEventSchema, type PaymentEvent } from '@byb/schemas/preorder';
import type { PaymentProvider } from './types';

let client: Stripe | undefined;

function stripe(): Stripe {
  client ??= new Stripe(serverEnv().STRIPE_SECRET_KEY ?? '');
  return client;
}

/** Any event we don't act on. Field values are unused once `type` is 'ignored'. */
const IGNORED_EVENT: PaymentEvent = {
  type: 'ignored',
  sessionId: 'ignored',
  paymentIntentId: null,
  email: 'ignored@example.com',
  amountCents: 0,
  currency: 'USD',
  offerCode: PREORDER_OFFER.code,
};

/**
 * Written to satisfy TR-BILL-07 and exercised by unit tests, but not selected
 * (`PAYMENTS_PROVIDER=mock` is the M0 default) until a Stripe account exists.
 * Refunds are out of scope here — per TR-BILL-07 they are handled in the
 * Stripe dashboard directly, not via this webhook.
 */
export const stripeProvider: PaymentProvider = {
  async createCheckout(email, offerCode) {
    const env = serverEnv();
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: PREORDER_OFFER.amountCents,
            product_data: { name: PREORDER_OFFER.title },
          },
          quantity: 1,
        },
      ],
      metadata: { offerCode },
      success_url: `${env.WEB_ORIGIN}/preorder/success?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.WEB_ORIGIN}/preorder/cancel`,
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { checkoutUrl: session.url, sessionId: session.id };
  },

  async parseWebhook(rawBody, headers): Promise<PaymentEvent> {
    const signature = headers.get('stripe-signature') ?? '';
    const event = stripe().webhooks.constructEvent(
      rawBody,
      signature,
      serverEnv().STRIPE_WEBHOOK_SECRET ?? '',
    );

    if (event.type !== 'checkout.session.completed') return IGNORED_EVENT;

    const session = event.data.object as Stripe.Checkout.Session;
    return paymentEventSchema.parse({
      type: 'checkout_completed',
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      email: session.customer_email ?? session.customer_details?.email ?? '',
      amountCents: session.amount_total ?? 0,
      currency: 'USD',
      offerCode: session.metadata?.offerCode ?? PREORDER_OFFER.code,
    });
  },
};
