import { z } from 'zod';
import { platformSchema } from './common';

/**
 * TR-ANL-02: event names are snake_case and typed here.
 *
 * The first block is the v4.0 set from TR-ANL-02, kept whole so M11 does not
 * redefine it. The second block is the four Gate 0 events named in M0.7; they
 * are additions to TR-ANL-02 (see DEC-035).
 */
export const analyticsEventSchema = z.discriminatedUnion('name', [
  // --- v4.0 (TR-ANL-02) -----------------------------------------------------
  z.strictObject({ name: z.literal('search_submitted'), props: z.strictObject({}) }),
  z.strictObject({
    name: z.literal('search_first_event'),
    props: z.strictObject({ ms: z.int().min(0) }),
  }),
  z.strictObject({
    name: z.literal('search_completed'),
    props: z.strictObject({
      cache: z.enum(['hit', 'partial', 'miss']),
      platforms: z.array(platformSchema),
      ms: z.int().min(0),
    }),
  }),
  z.strictObject({ name: z.literal('disambiguation_shown'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('disambiguation_picked'), props: z.strictObject({}) }),
  z.strictObject({
    name: z.literal('landed_breakdown_opened'),
    props: z.strictObject({ platform: platformSchema }),
  }),
  z.strictObject({
    name: z.literal('trust_signals_opened'),
    props: z.strictObject({ platform: platformSchema }),
  }),
  z.strictObject({ name: z.literal('price_history_viewed'), props: z.strictObject({}) }),
  z.strictObject({
    name: z.literal('outbound_click'),
    props: z.strictObject({
      platform: platformSchema,
      rank: z.int().min(1),
      isAffiliate: z.boolean(),
    }),
  }),
  z.strictObject({ name: z.literal('alert_started'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('alert_confirmed'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('alert_email_sent'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('alert_email_clicked'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('share_created'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('share_opened'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('zip_changed'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('signup_completed'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('pricing_viewed'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('checkout_started'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('subscription_started'), props: z.strictObject({}) }),

  // --- Gate 0 (M0.7) --------------------------------------------------------
  z.strictObject({
    name: z.literal('waitlist_signed_up'),
    props: z.strictObject({ source: z.string().max(40) }),
  }),
  // M0.4: added ahead of M0.7's PostHog wiring so the double opt-in has a
  // console-logged signal now; same event set M0.7 wires to PostHog (DEC-036).
  z.strictObject({ name: z.literal('waitlist_confirmed'), props: z.strictObject({}) }),
  z.strictObject({ name: z.literal('preorder_started'), props: z.strictObject({}) }),
  z.strictObject({
    name: z.literal('preorder_paid'),
    props: z.strictObject({ amountCents: z.int().min(0), offerCode: z.string().max(60) }),
  }),
  z.strictObject({
    name: z.literal('demo_card_opened'),
    props: z.strictObject({ slug: z.string().max(60), platform: platformSchema }),
  }),
  z.strictObject({ name: z.literal('page_view'), props: z.strictObject({ path: z.string().max(200) }) }),
  z.strictObject({
    name: z.literal('preorder_refunded'),
    props: z.strictObject({ amountCents: z.int().min(0) }),
  }),
]);
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type AnalyticsEventName = AnalyticsEvent['name'];
