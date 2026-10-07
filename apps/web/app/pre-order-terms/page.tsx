import type { Metadata } from 'next';
import { PREORDER_OFFER } from '@byb/config';

export const metadata: Metadata = { title: 'Pre-order Terms' };

/**
 * LEGAL-10 draft, pending legal review. Scope and defaults per
 * docs/08-REVIEW-ITEMS.md LEGAL-10/DECIDE-15: full refund on request until 30
 * days after launch; automatic refund if the product hasn't launched by a
 * stated date. "Before You Buy launches" is a placeholder date until a real
 * launch commitment exists.
 */
export default function PreorderTermsPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Pre-order Terms</h1>
      <p className="mt-2 text-sm font-medium text-amber-700">
        Draft — pending legal review. Published before launch.
      </p>

      <p className="mt-6 text-sm text-muted-foreground">
        {PREORDER_OFFER.title}: a one-time payment of {(PREORDER_OFFER.amountCents / 100).toLocaleString(
          'en-US',
          { style: 'currency', currency: 'USD' },
        )}{' '}
        reserves {PREORDER_OFFER.summary.toLowerCase()}
      </p>

      <h2 className="mt-8 text-lg font-semibold">Refunds</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {PREORDER_OFFER.refundTerms} Email us and we will refund you — no reason required.
      </p>

      <h2 className="mt-8 text-lg font-semibold">If launch is delayed</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        If Before You Buy has not launched within a stated date of this pre-order (final date to
        be set before launch), every outstanding pre-order is refunded automatically — you do not
        need to ask.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Chargebacks</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please ask for a refund first — it is faster for you and avoids a dispute on your card
        statement. We honor every refund request made under these terms.
      </p>
    </main>
  );
}
