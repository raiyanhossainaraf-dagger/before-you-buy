import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocal, serverEnv } from '@byb/config/server';
import { PREORDER_OFFER } from '@byb/config';

export const metadata: Metadata = { title: 'Test checkout' };

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/**
 * M0.5: stands in for a real payment page while `PAYMENTS_PROVIDER=mock`.
 * Clearly labeled so nobody mistakes it for a real checkout, even in a demo.
 */
export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; email?: string; offer?: string; amount?: string }>;
}) {
  if (!isLocal() || serverEnv().PAYMENTS_PROVIDER !== 'mock') notFound();

  const { session, email, offer, amount } = await searchParams;
  if (!session || !email || !offer || !amount) notFound();

  return (
    <main id="main" className="mx-auto max-w-md px-4 py-16">
      <p className="mb-6 inline-block rounded-control bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
        Test checkout — no real payment
      </p>

      <h1 className="text-2xl font-semibold tracking-tight">{PREORDER_OFFER.title}</h1>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{formatUsd(Number(amount))}</p>
      <p className="mt-4 text-sm text-muted-foreground">{PREORDER_OFFER.summary}</p>
      <p className="mt-2 text-sm font-medium">{PREORDER_OFFER.refundTerms}</p>
      <p className="mt-4 text-sm text-muted-foreground">Billing to {email}</p>

      <form action="/api/payments/mock-pay" method="POST" className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="session" value={session} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="offer" value={offer} />
        <input type="hidden" name="amount" value={amount} />
        <button
          type="submit"
          className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Pay {formatUsd(Number(amount))}
        </button>
      </form>

      <a
        href="/preorder/cancel"
        className="mt-3 block min-h-11 rounded-control border border-border px-4 py-2.5 text-center text-sm font-medium"
      >
        Cancel
      </a>
    </main>
  );
}
