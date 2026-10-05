# Before You Buy — Review Items Register (Legal, Decisions, Gaps)

| Field | Value |
|---|---|
| Version | 1.0 (Oct 5, 2026) |
| Owner | Zean & Dagger|
| Review cadence | Weekly until v4.0 launch; then at each milestone start |
| Related | [01-PRD §10](01-PRD.md#10-accuracy-limitations-and-legal) · [02-ARCHITECTURE §19](02-ARCHITECTURE.md#19-risks-and-open-decisions) · [06-IMPLEMENTATION-PLAN](06-IMPLEMENTATION-PLAN.md) · [09-CHANGE-MANAGEMENT](09-CHANGE-MANAGEMENT.md) |

> **Not legal advice.** This register lists what must be reviewed and by when, quotes the relevant terms as read in October 2026, and proposes engineering defaults so work can continue. Every `LEGAL-*` item needs a qualified lawyer's answer (US internet/consumer law, plus Australian advice for the operating entity). Terms change: re-read the source before relying on any quote here.

**How to use it**

- Each item has a **default to build with**. Claude Code and developers use the default, keep it behind configuration, and mention it in the PR.
- When an item is resolved, set **Status** to `resolved`, write the outcome in one line, and add a `DEC-*` entry in [09-CHANGE-MANAGEMENT](09-CHANGE-MANAGEMENT.md). Then update the affected docs.
- **Hard blocker** = the named milestone cannot exit until resolved.

Status values: `open` · `in-review` · `resolved` · `deferred`.

---

## 1. Summary

| ID | Item | Needed by | Blocker | Status |
|---|---|---|---|---|
| LEGAL-01 | Amazon scraping path (Conditions of Use, CFAA, anti-circumvention) | M17 | **Hard** | open |
| LEGAL-02 | Amazon Associates: price display rules, Creators API, ML restriction | M16 / M17 | **Hard** | open |
| LEGAL-03 | eBay API License: freshness, price modelling, AI use, retention | M17 | **Hard** | open |
| LEGAL-04 | Best Buy API terms: 72 h cache, pricing analysis, attribution | M17 | **Hard** | open |
| LEGAL-05 | FTC affiliate disclosure wording and placement | M16 | | open |
| LEGAL-06 | Review-authenticity statements: defamation / trade libel exposure | M9 | | open |
| LEGAL-07 | Price-history and "good price" claims | M10 | | open |
| LEGAL-08 | Privacy: policy, Australian Privacy Act, US state laws, CAN-SPAM, cookies | M0 | | open |
| LEGAL-09 | Terms of Service, disclaimers; developer/API terms (v4.5) | M0 / M21 | | open |
| LEGAL-10 | Gate 0 pre-orders: refund and delivery terms | M0 | | open |
| LEGAL-11 | Indirect tax: US sales tax on SaaS, AU GST, merchant of record | M18 | | open |
| LEGAL-12 | BrightData and backup unblocker terms; liability allocation | M5 | | open |
| LEGAL-13 | LLM provider terms: data use, retention, region | M6 | | open |
| LEGAL-14 | Trademarks: "Before You Buy" clearance; retailer marks and logos | M0 / M16 | | open |
| LEGAL-15 | Accessibility obligations (ADA, WCAG 2.2 AA) | M17 | | open |
| LEGAL-16 | Product images and content licensing | M11 | | open |
| LEGAL-17 | Affiliate program applications and terms (Associates, EPN, Best Buy) | M16 | | open |
| DECIDE-01 | Credit unit and quota conversion | M15 | | open |
| DECIDE-02 | Anonymous allowance | M7 / M15 | | open |
| DECIDE-03 | Alert sign-up creates an account | M13 | | open |
| DECIDE-04 | Second unblocking provider | M5 | | open |
| DECIDE-05 | Sales-tax data source | M8 | | open |
| DECIDE-06 | ZIP without sign-up | M8 | | open |
| DECIDE-07 | Stripe vs Paddle | M18 | | open |
| DECIDE-08 | eBay call quota / Application Growth Check | M4 / M14 | | open |
| DECIDE-09 | Domain name | M0 | | open |
| DECIDE-10 | Affiliate category economics (OQ-1) | Gate 2 | | open |
| DECIDE-11 | Search-to-purchase conversion measurement (OQ-2) | M17 | | open |
| DECIDE-12 | Vague-query handling (OQ-3) | M7 | | open |
| DECIDE-13 | Freshness windows per platform | M7 / M14 | | open |
| DECIDE-14 | LLM and embedding models; vector dimension | M2 / M6 | | open |
| DECIDE-15 | Gate 0 pre-order offer terms | M0 | | open |
| DECIDE-16 | Confirm TypeScript for the whole stack | M1 | | open |
| DECIDE-17 | Alert refresh cadence and expiry | M13 | | open |
| DECIDE-18 | Daily paid-provider spend cap | M5 | | open |
| DECIDE-19 | Price-history basis | M10 | | open |
| DECIDE-20 | Ranking defaults | M8 | | open |
| GAP-01 | v3 matching spec (FR-M1–M7, confidence model, R7) missing | M6 | | open |
| GAP-02 | v3 risk register R1–R7 missing | M17 | | open |
| GAP-03 | PRD refers to PA-API; Amazon retired it (Creators API) | M16 | | open |
| GAP-04 | Review data acquisition cost missing from unit economics | M9 | | open |
| GAP-05 | Free tier "3 tracked" vs alert/email rules for anonymous users | M13 | | open |
| GAP-06 | PRD API paths (`/api/search`) vs architecture `/v1` | — | | resolved (DEC-014) |
| GAP-07 | SSE event named `error` collides with `EventSource` | — | | resolved (DEC-015) |
| GAP-08 | "Source result" undefined for name searches | — | | resolved (TRD §6.3, §7.2) |

---

## 2. Legal and compliance review

### LEGAL-01 — Amazon scraping path · **hard blocker for M17**

- **Source:** PRD §10.4 ("Legal review of the Amazon scraping path should happen before the site accepts its first paying customer, not after").
- **Why it matters:** Amazon's Conditions of Use restrict automated access; exposure listed in the PRD is account termination, cease-and-desist and a potential CFAA claim. A dispute could also end the Associates relationship (LEGAL-02), which funds v4.0.
- **Current mitigation in design:** public listing pages only, no authentication, no circumvention of access controls beyond what a contracted unblocking provider does, respect rate limits, kill switch `provider.amazon`, migrate to Amazon's official API once eligible.
- **Questions for counsel:**
  1. Is displaying prices obtained via a third-party unblocking service (BrightData Web Unlocker) defensible under current US case law for public pages, and does use of an "unblocker" count as circumvention?
  2. Does it matter that the operating entity is Australian?
  3. What should the response plan be for a cease-and-desist (runbook in M17)?
- **Default to build with:** build as designed; keep Amazon fully switchable off; launch can proceed with eBay + Best Buy only if counsel says no.
- **Status:** open.

### LEGAL-02 — Amazon Associates policies and API access · **hard blocker for M17**

- **Source:** PRD §10.4 and Gate 2; [Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies); [Creators API / PA-API 5.0 deprecation](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation).
- **What the terms say (read Oct 2026):**
  - Your site "may only show prices and availability if: (a) we serve the link in which that price and availability data are displayed, or (b) you obtain Product pricing and availability data via Creators API or PA API."
  - A date/time stamp must be shown adjacent to pricing/availability, with the disclaimer: "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on [Amazon site] at the time of purchase will apply to the purchase of this product."
  - Product Advertising Content (other than images) may be cached up to 24 hours, then must be refreshed; images may not be stored (links to images up to 24 hours).
  - In a "comparison" format with other sellers' prices, you "must display both the lowest 'new' price and, if we provide it to you, the lowest 'used' price" on Amazon.
  - You may not use Program Content "to, directly or indirectly, develop or improve large language or multimodal models, machine learning models or related technology."
  - PA-API 5.0 was deprecated April 30, 2026 and retired May 15, 2026; the **Creators API** replaces it (OAuth 2.0 client credentials). Access requires at least **10 qualifying referred sales in the last 30 days**.
- **Why it matters:** Showing **scraped** Amazon prices next to Amazon affiliate links appears to conflict with rule (a)/(b) until the Creators API is available — which itself requires sales the site must first generate. This is a chicken-and-egg problem the PRD does not address. The ML restriction may also limit using Creators API content in matching/trust scoring after migration.
- **Questions for counsel:**
  1. Can Amazon results be shown with affiliate links before Creators API access? If not, options: show Amazon without affiliate links; show Amazon as a link-out without a price; delay Amazon; or launch Amazon prices only after eligibility.
  2. Does passing Creators API content to an LLM for *matching* (not training) count as "develop or improve" ML models?
  3. Do the comparison-format rules (lowest new and used price) apply to our layout?
- **Default to build with:** implement timestamp + disclaimer, ≤ 24 h display age, no image storage, and a feature flag `amazon.affiliate-links` (default **off** until counsel answers; DEC-034). Build the Creators API client as a third Amazon transport in M16 so the migration is configuration.
- **Status:** open.

### LEGAL-03 — eBay API License Agreement · **hard blocker for M17**

- **Source:** architecture §19; [eBay API License Agreement](https://developer.ebay.com/join/api-license-agreement); [eBay call limits](https://developer.ebay.com/develop/get-started/api-call-limits).
- **What the terms say (as quoted in the architecture doc):** listings shown must be no more than 6 hours older than eBay's own, other content 24 hours; eBay content may not be used "to suggest or model prices for items listed on eBay"; data from "Restricted APIs" may not go into non-eBay AI without written consent; attribution requirements apply; 5,000 Browse API calls/day by default.
- **Why it matters:** may prohibit eBay in **price history** (CW-7) and "is the discount real" claims, and may prohibit sending eBay data to the LLM for **matching** (AR-1).
- **Questions for counsel:** Is the Browse API a "Restricted API"? Does showing an eBay price next to others' prices, or in a 90-day chart, count as modelling prices? What retention is permitted for listing data used only for display?
- **Default to build with:** `ebay.historyAllowed = false`, `ebay.aiUseAllowed = false` (identifier/embedding matching only), display ≤ 6 h, retain 24 h, attribution on.
- **Status:** open.

### LEGAL-04 — Best Buy API terms · **hard blocker for M17**

- **Source:** architecture §19; [Best Buy API terms](https://developer.bestbuy.com/legal).
- **What the terms say (as quoted in the architecture doc):** content may be cached "on a temporary basis not to exceed seventy-two (72) hours"; no use "for the benefit of any third party (such as other retailers)" to analyze Best Buy pricing; Best Buy logo required where its data appears; 5 calls/s, 50,000/day.
- **Why it matters:** 72 h retention rules out Best Buy in 90-day history unless permission is granted; the pricing-analysis clause may affect comparison itself.
- **Questions for counsel:** Is side-by-side comparison for consumers "for the benefit of a third party"? Can we request written permission for history?
- **Default to build with:** `bestbuy.historyAllowed = false`, `bestbuy.aiUseAllowed = false`, retain ≤ 72 h, logo attribution on.
- **Status:** open.

### LEGAL-05 — FTC affiliate disclosure

- **Source:** PRD CW-14, §10.4; FTC Endorsement Guides (16 CFR Part 255).
- **Review:** wording, placement (above results, near links, in emails), mobile visibility, "affiliate link" marker, and the claim "never changes the order" (must be true and provable — TR-RANK-03 test).
- **Default to build with:** copy in [07-UI-UX-DESIGN §9.3](07-UI-UX-DESIGN.md#93-standard-copy-blocks-final-wording-subject-to-legal-0205); disclosure above the fold on results pages.
- **Status:** open.

### LEGAL-06 — Review-authenticity statements

- **Source:** PRD §3 (headline differentiator), CW-6.
- **Why it matters:** publicly labelling a seller's listing as having suspicious reviews can draw defamation, trade-libel or unfair-competition claims (US) from sellers or brands. The FTC's rule on consumer reviews (16 CFR Part 465, final Aug 2024) targets fake reviews by businesses; it does not authorize third parties to accuse.
- **Review:** band names and signal wording; "patterns, not proof" disclaimer; a correction/dispute channel for sellers; whether scores should be withheld below a confidence level.
- **Default to build with:** wording rules TR-TRUST-05, forbidden words list, dispute email address on "How trust scores work", log of model version per score.
- **Status:** open.

### LEGAL-07 — Price-history and "good price" claims

- **Review:** statements like "Near its 90-day low" and "Cheaper than on 85% of days" must be accurate and explained; never repeat a retailer's "was" price as fact; disclaimers on history pages.
- **Default to build with:** TR-HIST-03/05 copy; methodology on "How we rank".
- **Status:** open.

### LEGAL-08 — Privacy and email

- **Scope:** Privacy Policy (published before any email is collected — M0); data inventory ([05-SECURITY §9](05-SECURITY.md#9-privacy-and-data-protection)); **Australian Privacy Act** — the A$3M small-business exemption was still in force as of late September 2026 (no bill removing it), but confirm the entity is not covered via exceptions (e.g. trading in personal information) and plan for its removal; **US state privacy laws** (CCPA/CPRA and others: thresholds, "sale/share" via analytics/affiliate cookies); **CAN-SPAM** for alert and waitlist emails (unsubscribe, postal address, sender identity); cookies and analytics disclosures; data-breach notification obligations.
- **Default to build with:** email-only collection, IP hashing, one-click unsubscribe, deletion/export self-serve, PostHog without autocapture of inputs.
- **Status:** open.

### LEGAL-09 — Terms of Service and developer terms

- **Scope:** consumer Terms (no guarantee on third-party prices, limitation of liability, acceptable use, governing law for an Australian entity serving US users); developer/API terms at v4.5 (rate limits, no resale of retailer data where terms forbid it, SLA for Enterprise only).
- **Default to build with:** drafts in M0 marked pending; final before M21.
- **Status:** open.

### LEGAL-10 — Gate 0 pre-orders

- **Scope:** taking money for a product that doesn't exist yet: refund policy (PRD says refundable), delivery timeline promise, what happens if Gate 0 fails, chargeback handling, consumer-law requirements for pre-sales.
- **Default to build with:** full refund on request until 30 days after launch; automatic refunds if the product doesn't launch within a stated date (DECIDE-15).
- **Status:** open.

### LEGAL-11 — Indirect tax

- **Scope:** US state sales tax on SaaS/data subscriptions for an Australian seller (economic nexus), AU GST if any Australian customers, invoicing requirements; Stripe Tax vs Paddle as merchant of record (DECIDE-07). Ask an accountant (architecture §19).
- **Status:** open.

### LEGAL-12 — Unblocking provider terms

- **Scope:** BrightData and backup vendor acceptable-use terms, KYC requirements, who bears liability for target-site claims, data-retention by the vendor.
- **Status:** open.

### LEGAL-13 — LLM provider terms

- **Scope:** whether prompts/outputs are used for training (use paid tiers that don't), retention, region; combined with LEGAL-02/03/04 on whether retailer data may be sent to the LLM at all.
- **Default to build with:** paid API tier; no personal data in prompts; retailer data only where `aiUseAllowed`.
- **Status:** open.

### LEGAL-14 — Trademarks

- **Scope:** clearance search for "Before You Buy" (a common phrase) in the US and AU before investing in brand; correct use of Amazon, eBay and Best Buy names and logos (Associates: do not alter Amazon marks; Best Buy logo where required).
- **Status:** open.

### LEGAL-15 — Accessibility

- **Scope:** ADA exposure for US consumer websites; WCAG 2.2 AA is the build target (NFR-07); publish an accessibility statement.
- **Status:** open.

### LEGAL-16 — Product images and content

- **Scope:** Amazon images may not be stored (Associates policy) and scraped images carry copyright risk; eBay/Best Buy image use per API terms.
- **Default to build with:** prefer Best Buy/eBay API images within their terms and display windows; for Amazon, no stored or proxied images until the Creators API (show a neutral placeholder); never re-host retailer images in our CDN beyond policy windows.
- **Status:** open.

### LEGAL-17 — Affiliate programs

- **Scope:** applications and acceptance for Amazon Associates (US), eBay Partner Network, Best Buy's affiliate program; each program's rules on link formats, cookie behavior, prohibited placements (e.g. emails), disclosure, and whether our data sourcing conflicts with their terms.
- **Status:** open.

---

## 3. Product, business and technical decisions

| ID | Decision | Options | **Default to build with** | Needed by |
|---|---|---|---|---|
| DECIDE-01 | How many credits does a default 3-platform live search cost, and how do "searches included" convert to credit quotas? | (a) 3 credits flat for the default set; (b) 3 + 2 per extra platform = 7 | (b), literal PRD reading; quota = searches × 7 credits; all values in `packages/config` | M15 |
| DECIDE-02 | What can anonymous visitors do? | Cache hits only; N live/day; same as Free | 5/min, **10 live searches/day** per anon ID and IP hash; cache hits unlimited within rate limit | M7 |
| DECIDE-03 | Does setting an alert create an account? | Email-only subscription; passwordless account | Passwordless account via magic link (double opt-in); personal org on Free | M13 |
| DECIDE-04 | Which second unblocking provider? | Evaluate 2–3 vendors on Amazon fixtures, price, terms (LEGAL-12) | Pick in M5 by fixture pass rate and cost per 1k | M5 |
| DECIDE-05 | Sales-tax data source | ZIP-level rate dataset (monthly file) vs tax API | Dataset if accuracy test meets "within $2" on QA sample; store ppm with ranges | M8 |
| DECIDE-06 | ZIP without sign-up | IP geolocation guess + cookie + "Change" link; ask up front | IP guess shown with "Change", stored in cookie (architecture §19) | M8 |
| DECIDE-07 | Stripe or Paddle | Stripe Billing + Stripe Tax (you register); Paddle MoR | Stripe (native meters) unless accountant advises MoR (LEGAL-11) | M18 |
| DECIDE-08 | eBay daily quota | Stay at 5,000/day; apply for Application Growth Check | Apply before launch; pre-crawl uses ≤ 70% | M4 |
| DECIDE-09 | Domain name | — | Placeholder `<domain>` in config | M0 |
| DECIDE-10 | Which categories carry workable affiliate commission (OQ-1)? | Track by category post-launch | Record category on clicks/orders; review at Gate 2 | Gate 2 |
| DECIDE-11 | Measure search-to-purchase conversion (OQ-2) | Import affiliate reports | Manual monthly import at v4.0; automate later | M17 |
| DECIDE-12 | Vague queries (OQ-3) | Disambiguation picker; best-guess comparison | Picker (≤ 6 products), 0 credits | M7 |
| DECIDE-13 | Freshness windows | Per-platform display ages | Amazon 6 h (≤ 24 h by policy), eBay 6 h, Best Buy 24 h; tune for > 70% cache hit | M7 |
| DECIDE-14 | LLM + embedding models; vector dimension | Behind AI SDK interface | Current Gemini Flash-class model for matching; Gemini embedding model at **768** dims | M2 |
| DECIDE-15 | Pre-order offer ("$49 for 3 months, refundable") | One-time $49 for 3 months of Starter; $49/month × 3 | One-time **$49 = 3 months of Starter at launch**, fully refundable | M0 |
| DECIDE-16 | One language | TypeScript; Python | TypeScript (architecture recommendation) | M1 |
| DECIDE-17 | Alert refresh cadence and expiry | Cost vs freshness | Refresh alerted products every 12 h; alerts expire after 180 days with a reminder | M13 |
| DECIDE-18 | Daily paid-provider spend cap | — | **$10/day** at launch (≈ 2,200 uncached Amazon searches), raised with traffic | M5 |
| DECIDE-19 | Price-history basis | Listed vs landed; new only vs all conditions | Listed price, condition = new, policy-allowed platforms | M10 |
| DECIDE-20 | Ranking defaults | — | New-only scope; tie window 2% / $3; exclude `strong_concerns` from top 3 | M8 |

---

## 4. Gaps and inconsistencies in the source documents

| ID | Gap | Impact | Resolution / default |
|---|---|---|---|
| GAP-01 | PRD v4 keeps v3 §5 (FR-M1–FR-M7), the confidence model and the R7 variant-aware pipeline "as written", but v3 is not available. | Matching spec incomplete | Add v3 PRD as `docs/reference/prd-v3.md`; until then TRD §7 is the working spec; reconcile in M6.8 |
| GAP-02 | PRD v4 retains the v3 risk register R1–R7 "in full" but it is not available. | Risks may be missed | Add to `docs/reference/`; review against [05-SECURITY](05-SECURITY.md) before M17 |
| GAP-03 | PRD refers to PA-API qualification; PA-API was retired in May 2026 and replaced by the Creators API (10 qualifying sales / 30 days). | Gate 2 metric and migration plan use an outdated name | Gate 2 metric reads "Amazon Creators API qualified"; Creators API transport in M16 (LEGAL-02) |
| GAP-04 | Unit economics (3 billable units per search) excludes fetching Amazon review content for CW-6. | Real cost per search higher than modelled | Cap review sampling (TR-TRUST-06), track `spend.trust`, re-cost after M9 |
| GAP-05 | Free tier lists "3 tracked" alerts, while CW-8/CW-10 imply anonymous use; unclear whether alerts need an account. | Flow ambiguity | DECIDE-03 default (passwordless account) |
| GAP-06 | PRD uses `/api/search`; architecture versions the public API as `/v1`. | Naming | Resolved: DEC-014 |
| GAP-07 | Architecture names an SSE event `error`, which collides with `EventSource`'s connection-error event. | Client bug risk | Resolved: `platform_error` (DEC-015) |
| GAP-08 | "Source result renders within 2 s" has no source product for name searches. | Ambiguous target | Resolved: first meaningful event = `source` (resolved product) or `disambiguation` (TRD §6.3, §7.2) |

---

## 5. Questions to bring to counsel (one sitting)

1. Amazon: scraping public pages via an unblocking vendor — risk level and mitigations (LEGAL-01).
2. Amazon Associates: can scraped Amazon prices appear with or near affiliate links before Creators API access; comparison-format obligations; ML restriction scope (LEGAL-02).
3. eBay: Restricted APIs, "model prices", AI use, retention (LEGAL-03).
4. Best Buy: comparison as "benefit of a third party", 72 h limit, permission for history (LEGAL-04).
5. Review-authenticity labelling: wording, disclaimers, dispute process (LEGAL-06).
6. Privacy: AU entity serving US consumers — which laws apply now, which soon (LEGAL-08).
7. Pre-orders and Terms: refund promises, liability limits, governing law (LEGAL-09, LEGAL-10).
8. Tax: merchant of record vs registering for US sales tax (LEGAL-11, with an accountant).
