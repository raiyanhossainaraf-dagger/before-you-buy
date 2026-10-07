/**
 * Values that are product decisions, not deployment settings. They live in code
 * (rule: "all values in packages/config") so a change is reviewable, and they
 * are safe for the client bundle.
 */

/** DECIDE-09: no domain chosen yet. Overridable with APP_DOMAIN. */
export const DEFAULT_APP_DOMAIN = 'beforeyoubuy.local';

/** PRD §3: the positioning claim, used verbatim in the hero and in metadata. */
export const POSITIONING_CLAIM =
  'Before You Buy tells you whether a listing can be trusted, not only whether it is cheap.';

/** DECIDE-15: one-time $49 = 3 months of Starter at launch, fully refundable. */
export const PREORDER_OFFER = {
  code: 'starter_3mo_launch',
  amountCents: 4_900,
  currency: 'USD',
  title: '$49 — 3 months of Starter at launch',
  summary: 'One payment of $49 covers your first three months of Starter when we launch.',
  refundTerms: 'Fully refundable on request until 30 days after launch.',
} as const;

/**
 * LEGAL-08: the exact consent sentence shown at the point of collection. Bump
 * the version whenever the wording changes — waitlist_signups.consent_text_version
 * records which sentence each person agreed to.
 */
export const CONSENT = {
  version: '2026-10-05.1',
  text:
    'Email me once when Before You Buy launches, plus occasional progress updates. ' +
    'One click unsubscribes. We never sell your address.',
} as const;

/**
 * CAN-SPAM / SEC-53: bulk mail must carry a sender identity and postal
 * address. No address is set yet (LEGAL-08 pending legal review); M0.6
 * replaces this placeholder with the real one.
 */
export const SENDER_IDENTITY = 'Before You Buy (postal address pending legal review)';

/**
 * LEGAL-08/09: the legal entity behind Before You Buy, named on the Privacy
 * Policy and Terms of Service. Placeholders until the entity is incorporated
 * and legal review sets the real values — M0.6 content is explicitly marked
 * draft so this is never read as final.
 */
export const LEGAL_ENTITY = {
  name: '[Legal entity name pending — e.g. Before You Buy Pty Ltd]',
  address: '[Postal address pending legal review]',
  contactEmail: 'privacy@beforeyoubuy.local',
  governingLaw: '[Governing law pending legal review]',
} as const;

/** PRD §8. Shown as a preview at Gate 0; billing itself is v4.5 (M18). */
export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    searches: 100,
    rateLimit: '5/min',
    tracked: '3 tracked',
    api: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    priceCents: 4_900,
    searches: 1_000,
    rateLimit: '60/min',
    tracked: '25 tracked',
    api: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    priceCents: 19_900,
    searches: 5_000,
    rateLimit: '300/min',
    tracked: 'Unlimited',
    api: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    priceCents: 79_900,
    searches: 25_000,
    rateLimit: '1,000/min',
    tracked: 'Unlimited',
    api: true,
  },
] as const;

/** UI §9.3 — wording is subject to LEGAL-02/05. */
export const COPY = {
  affiliateDisclosure:
    'We may earn a commission when you buy through links on this page. It never changes the order of results — options that earn us nothing are shown when they are better.',
  perCardAffiliateMarker: 'Affiliate link',
  trustFooter: 'These are patterns in public reviews, not proof.',
  accuracy: 'We check often; retailers set the final price at checkout.',
} as const;
