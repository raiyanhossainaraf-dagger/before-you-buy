import { analyticsEventSchema, type AnalyticsEvent } from '@byb/schemas/analytics';

/**
 * ponytail: console-only. M0.7 builds the real PostHog server client and
 * `ANALYTICS_TRANSPORT` switch for the full TR-ANL-02 event set; this covers
 * just the two M0.4 events (`waitlist_signed_up`, `waitlist_confirmed`) early
 * so the double opt-in has a signal now. Swap the body, not the call sites.
 */
export function track(event: AnalyticsEvent): void {
  const parsed = analyticsEventSchema.parse(event);
  console.log(`[analytics] ${parsed.name}`, parsed.props);
}
