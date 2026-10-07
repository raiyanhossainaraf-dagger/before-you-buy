import { serverEnv } from '@byb/config/server';
import { mockProvider } from './mock';
import { stripeProvider } from './stripe';
import type { PaymentProvider } from './types';

export type { PaymentProvider } from './types';

export function getPaymentProvider(): PaymentProvider {
  return serverEnv().PAYMENTS_PROVIDER === 'stripe' ? stripeProvider : mockProvider;
}
