import type { Metadata } from 'next';
import { LEGAL_ENTITY } from '@byb/config';
import { LegalDraftBanner } from '../_components/legal-draft-banner';

export const metadata: Metadata = { title: 'Privacy Policy' };

/**
 * LEGAL-08 draft. Lists only what the code actually collects today — no
 * speculative future collection (ZIP cookie, accounts, alerts are M1+ and
 * are not described here until they exist).
 */
export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <LegalDraftBanner />

      <p className="text-sm text-muted-foreground">
        {LEGAL_ENTITY.name} (&ldquo;Before You Buy&rdquo;, &ldquo;we&rdquo;) operates beforeyoubuy.local. This policy
        covers only what the site collects today, during our pre-launch demand test.
      </p>

      <h2 className="mt-8 text-lg font-semibold">What we collect</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Email address</strong> — when you join the
          waitlist or pre-order, together with which consent sentence you agreed to and its
          version, and the source/UTM parameters and referrer that brought you to the page (so we
          can tell which outreach channel is working).
        </li>
        <li>
          <strong className="text-foreground">Pre-order details</strong> — your email, the offer
          and amount paid, and the checkout session status (paid/refunded). Card details never
          reach our servers; they are handled entirely by our payment processor.
        </li>
        <li>
          <strong className="text-foreground">Turnstile verification</strong> — submitting the
          waitlist or pre-order form sends a verification token, and your IP address, to
          Cloudflare&apos;s Turnstile service to confirm you are not a bot. We do not store your IP
          address; it is used only for that one verification call and, briefly and in memory, to
          rate-limit repeated submissions.
        </li>
        <li>
          <strong className="text-foreground">Analytics events</strong> — anonymous product
          events (e.g. a waitlist signup or a demo card being opened) are recorded without your
          email, IP address, or any free-text you typed.
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Cookies</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We do not set any cookies ourselves today. Cloudflare&apos;s Turnstile widget may set its own
        cookie while verifying you are not a bot; see Cloudflare&apos;s privacy policy for details.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Why we collect it</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        To send the waitlist confirmation and launch email, process and refund pre-orders, prevent
        automated abuse of these forms, and measure whether enough people want this product to
        justify building it.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Unsubscribe and deletion</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Every email we send carries an unsubscribe link. To delete your data sooner, email{' '}
        {LEGAL_ENTITY.contactEmail}.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Where this is pending review</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This draft does not yet state which privacy laws apply to our use of this data (including
        the Australian Privacy Act and US state privacy laws), our retention periods, or a formal
        complaints process. The legal entity name and postal address above are placeholders. All
        of this is pending legal review before launch.
      </p>

      <p className="mt-8 text-xs text-muted-foreground">Postal address: {LEGAL_ENTITY.address}</p>
    </main>
  );
}
