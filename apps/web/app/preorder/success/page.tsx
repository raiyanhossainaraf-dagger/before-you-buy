import type { Metadata } from 'next';
import { PREORDER_OFFER } from '@byb/config';

export const metadata: Metadata = { title: "You're pre-ordered" };

export default function PreorderSuccessPage() {
  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re pre-ordered</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        We emailed you a receipt. {PREORDER_OFFER.refundTerms}
      </p>
      <a href="/pre-order-terms" className="mt-4 inline-block text-sm font-medium underline">
        Read the pre-order terms
      </a>
      <a href="/" className="mt-8 block text-sm font-medium underline">
        Back to the homepage
      </a>
    </main>
  );
}
