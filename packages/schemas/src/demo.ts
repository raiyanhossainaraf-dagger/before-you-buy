import { z } from 'zod';
import { isoTimestampSchema } from './common';
import {
  priceHistory90dSchema,
  rankingSchema,
  resultListingSchema,
  reviewAuthenticitySchema,
} from './listing';

/**
 * M0.3: trust signals and price history are invented example values (no
 * provider accounts to pull real ones from yet) — everything else (price,
 * condition, seller, warranty, returns) is hand-captured from the retailer.
 * `illustrative: true` marks that distinction on the two blocks it applies
 * to, rather than one flag for the whole document.
 */
const demoTrustSchema = reviewAuthenticitySchema.extend({ illustrative: z.boolean() });
const demoHistorySchema = priceHistory90dSchema.extend({ illustrative: z.boolean() });
const demoListingSchema = resultListingSchema.extend({ reviewAuthenticity: demoTrustSchema });

/** A precomputed comparison stored in apps/web/content/demo/. */
export const demoComparisonSchema = z.strictObject({
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'slug is lowercase alphanumeric with hyphens'),
  capturedAt: isoTimestampSchema,
  capturedBy: z.string().min(1).max(120),
  product: z.strictObject({
    name: z.string().min(1).max(200),
    brand: z.string().min(1).max(80),
    category: z.string().min(1).max(80),
    /**
     * M0.3: a neutral illustration by default (LEGAL-16 forbids retailer
     * listing images). `source`/`license` let a manufacturer press image
     * replace the illustration later with its provenance on record.
     */
    image: z
      .strictObject({
        src: z.string().min(1).max(300),
        alt: z.string().min(1).max(200),
        source: z.string().min(1).max(120),
        license: z.string().min(1).max(120),
      })
      .optional(),
  }),
  zip: z.string().regex(/^\d{5}$/, 'zip is five digits'),
  listings: z.array(demoListingSchema).min(2).max(6),
  ranking: rankingSchema,
  history: demoHistorySchema,
});
export type DemoComparison = z.infer<typeof demoComparisonSchema>;
