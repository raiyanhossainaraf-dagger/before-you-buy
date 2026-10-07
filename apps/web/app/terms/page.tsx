import type { Metadata } from 'next';
import { LEGAL_ENTITY } from '@byb/config';
import { LegalDraftBanner } from '../_components/legal-draft-banner';

export const metadata: Metadata = { title: 'Terms of Service' };

/** LEGAL-09 draft. */
export default function TermsPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <LegalDraftBanner />

      <p className="text-sm text-muted-foreground">
        These terms cover your use of the Before You Buy website, operated by {LEGAL_ENTITY.name}.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Using the site</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You may browse the site, join the waitlist, and place a pre-order. You must provide a
        real email address you control and not use the site to abuse, scrape, or disrupt it.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Pre-orders</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Pre-orders are governed separately by the{' '}
        <a href="/pre-order-terms" className="underline-offset-4 hover:underline">
          Pre-order Terms
        </a>
        , which cover refunds and what happens if launch is delayed.
      </p>

      <h2 className="mt-8 text-lg font-semibold">No guarantee on third-party prices</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Any prices, availability, or product information shown on this site — including in demo
        content — reflect a point in time and the retailer&apos;s listing at that time, not a current
        offer from us. Retailers set the final price at checkout; we make no guarantee it will
        match what was shown here.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Limitation of liability</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The site and any information on it are provided &ldquo;as is&rdquo;, without warranty of any kind. To
        the fullest extent permitted by law, {LEGAL_ENTITY.name} is not liable for any indirect,
        incidental, or consequential damages arising from your use of the site or reliance on
        information shown on it.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Governing law</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        These terms are governed by the laws of {LEGAL_ENTITY.governingLaw}, pending legal review.
      </p>

      <p className="mt-8 text-sm text-muted-foreground">
        Questions? Email {LEGAL_ENTITY.contactEmail}.
      </p>
    </main>
  );
}
