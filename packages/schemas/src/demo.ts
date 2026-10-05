import { z } from 'zod';
import { isoTimestampSchema } from './common';
import { priceHistory90dSchema, rankingSchema, resultListingSchema } from './listing';

/**
 * M0.3: a precomputed comparison stored in apps/web/content/demo/.
 *
 * `_sample: true` marks figures that were invented rather than captured from a
 * retailer. The card renders a visible "Sample data" notice for those, and
 * docs/reports/gate-0.md makes replacing them a prerequisite to running the
 * Gate 0 test — a public demo with invented prices would misrepresent the
 * product.
 */
export const demoComparisonSchema = z.strictObject({
  _sample: z.boolean(),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'slug is lowercase alphanumeric with hyphens'),
  capturedAt: isoTimestampSchema,
  product: z.strictObject({
    name: z.string().min(1).max(200),
    brand: z.string().min(1).max(80),
    category: z.string().min(1).max(80),
  }),
  zip: z.string().regex(/^\d{5}$/, 'zip is five digits'),
  listings: z.array(resultListingSchema).min(2).max(6),
  ranking: rankingSchema,
  history: priceHistory90dSchema,
});
export type DemoComparison = z.infer<typeof demoComparisonSchema>;
