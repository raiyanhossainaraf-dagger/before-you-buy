import { z } from 'zod';
import {
  isoTimestampSchema,
  moneyRangeSchema,
  moneySchema,
  platformSchema,
} from './common';

/** TRD §11.2 signal vocabulary. */
export const trustSignalCodeSchema = z.enum([
  'RATING_SHAPE',
  'VELOCITY_BURST',
  'VERIFIED_SHARE',
  'TEXT_DUPLICATION',
  'INCENTIVE_LANGUAGE',
  'VARIANT_MERGING',
  'CROSS_PLATFORM_DIVERGENCE',
  'SELLER_PROFILE',
  'RATING_TEXT_MISMATCH',
]);

/** TR-TRUST-05: band labels are fixed wording; never "fake" or "fraud". */
export const trustBandSchema = z.enum([
  'consistent',
  'some_concerns',
  'strong_concerns',
  'insufficient_data',
]);
export type TrustBand = z.infer<typeof trustBandSchema>;

export const TRUST_BAND_LABELS: Record<TrustBand, string> = {
  consistent: 'Reviews look consistent',
  some_concerns: 'Some concerns',
  strong_concerns: 'Strong concerns',
  insufficient_data: 'Not enough data',
};

/** TRD §11.1 */
export const reviewAuthenticitySchema = z.strictObject({
  score: z.int().min(0).max(100).nullable(),
  band: trustBandSchema,
  signals: z.array(
    z.strictObject({
      code: trustSignalCodeSchema,
      label: z.string().max(200),
      effect: z.enum(['raises', 'lowers', 'neutral']),
      weight: z.number(),
    }),
  ),
  reviewCount: z.int().min(0).nullable(),
  averageRating: z.number().min(0).max(5).nullable(),
  analyzedAt: isoTimestampSchema,
  modelVersion: z.string().max(40),
});
export type ReviewAuthenticity = z.infer<typeof reviewAuthenticitySchema>;

/** TRD §12 */
export const priceHistory90dSchema = z.strictObject({
  basis: z.literal('listed_new'),
  platforms: z.array(platformSchema),
  minCents: z.int(),
  maxCents: z.int(),
  medianCents: z.int(),
  currentCents: z.int(),
  currentPercentile: z.int().min(0).max(100),
  daysWithData: z.int().min(0),
  insufficientData: z.boolean(),
  series: z
    .array(
      z.strictObject({
        day: z.iso.date(),
        minCents: z.int(),
        platform: platformSchema.optional(),
      }),
    )
    .optional(),
});
export type PriceHistory90d = z.infer<typeof priceHistory90dSchema>;

export const conditionSchema = z.enum(['new', 'refurbished', 'used', 'open_box']);
export type Condition = z.infer<typeof conditionSchema>;

export const CONDITION_LABELS: Record<Condition, string> = {
  new: 'New',
  refurbished: 'Refurbished',
  used: 'Used',
  open_box: 'Open box',
};

/**
 * TRD §6.4. `outboundUrl` is deliberately optional here, unlike the TRD type:
 * M0 demo cards carry no outbound link at all (M0.3 forbids affiliate links and
 * rule 11 allows retailer links only through /go/{token}, which arrives in M16).
 */
export const resultListingSchema = z.strictObject({
  listingId: z.string().min(1).max(64),
  platform: platformSchema,
  title: z.string().min(1).max(400),
  imageUrl: z.url().optional(),
  outboundUrl: z.string().startsWith('/go/').optional(),
  condition: conditionSchema,
  conditionDetail: z.string().max(80).optional(),
  seller: z.strictObject({
    name: z.string().min(1).max(120),
    isRetailer: z.boolean(),
    rating: z.number().min(0).max(5).optional(),
    ratingCount: z.int().min(0).optional(),
  }),
  warranty: z.strictObject({
    months: z.int().min(0).nullable(),
    provider: z.enum(['manufacturer', 'retailer', 'seller', 'unknown']),
    text: z.string().max(200).optional(),
  }),
  returns: z.strictObject({
    windowDays: z.int().min(0).nullable(),
    freeReturns: z.boolean().optional(),
    text: z.string().max(200).optional(),
  }),
  inStock: z.boolean(),
  match: z.strictObject({
    confidence: z.number().min(0).max(1),
    variant: z.enum(['exact', 'different', 'unknown']),
    method: z.enum(['gtin', 'mpn', 'llm', 'url']),
  }),
  listedPrice: moneySchema,
  shippingCost: z.union([moneySchema, moneyRangeSchema]).nullable(),
  estimatedTax: z.union([moneySchema, moneyRangeSchema]),
  landedPrice: moneyRangeSchema,
  landedPriceComplete: z.boolean(),
  uncertainComponents: z.array(z.enum(['shipping', 'tax'])),
  priceVerification: z.strictObject({
    status: z.enum(['verified', 'pending', 'unverified', 'not_required']),
    verifiedAt: isoTimestampSchema.optional(),
  }),
  reviewAuthenticity: reviewAuthenticitySchema,
  checkedAt: isoTimestampSchema,
  attribution: z
    .strictObject({
      text: z.string().max(200),
      logo: z.enum(['bestbuy', 'ebay']).optional(),
    })
    .optional(),
  affiliate: z.strictObject({
    isAffiliate: z.boolean(),
    program: z
      .enum(['amazon_associates', 'ebay_partner_network', 'bestbuy_affiliate'])
      .optional(),
  }),
  disclaimers: z.array(z.string().max(400)).optional(),
});
export type ResultListing = z.infer<typeof resultListingSchema>;

/** TRD §13 */
export const rankingSchema = z.strictObject({
  conditionScope: z.enum(['new', 'any']),
  top: z.array(
    z.strictObject({
      listingId: z.string().min(1).max(64),
      rank: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      label: z.string().max(80),
      reasons: z.array(
        z.strictObject({ code: z.string().max(40), text: z.string().max(200) }),
      ),
    }),
  ),
  cheaperAlternative: z
    .strictObject({
      listingId: z.string().min(1).max(64),
      savingCents: z.int(),
      reasons: z.array(
        z.strictObject({ code: z.string().max(40), text: z.string().max(200) }),
      ),
    })
    .optional(),
  excluded: z.array(
    z.strictObject({
      listingId: z.string().min(1).max(64),
      reason: z.enum([
        'variant_mismatch',
        'low_confidence',
        'out_of_stock',
        'strong_review_concerns',
      ]),
    }),
  ),
});
export type Ranking = z.infer<typeof rankingSchema>;
