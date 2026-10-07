import type { Metadata } from 'next';
import { COPY } from '@byb/config';
import { LegalDraftBanner } from '../_components/legal-draft-banner';

export const metadata: Metadata = { title: 'Affiliate Disclosure' };

/** LEGAL-05 draft. Copy is UI §9.3's standard blocks, verbatim. */
export default function AffiliateDisclosurePage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Affiliate Disclosure</h1>
      <LegalDraftBanner />

      <p className="text-sm text-muted-foreground">{COPY.affiliateDisclosure}</p>

      <p className="mt-6 text-sm text-muted-foreground">
        No affiliate links are live on this site yet — we are still in our pre-launch demand test.
        When they go live, every affiliate link will carry the &ldquo;{COPY.perCardAffiliateMarker}&rdquo;
        marker next to it.
      </p>

      <p className="mt-6 text-xs text-muted-foreground">{COPY.trustFooter}</p>
    </main>
  );
}
