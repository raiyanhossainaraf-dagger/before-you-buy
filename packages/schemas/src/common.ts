import { z } from 'zod';

/** TR-CONV-08: adding a retailer extends this enum and the adapter registry only. */
export const platformSchema = z.enum(['amazon', 'ebay', 'bestbuy']);
export type Platform = z.infer<typeof platformSchema>;

export const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: 'Amazon',
  ebay: 'eBay',
  bestbuy: 'Best Buy',
};

/**
 * TR-CONV-02: money is integer cents. A single currency until v6.0 adds AUD,
 * so the literal stays a literal rather than an enum of one.
 */
export const moneySchema = z.strictObject({
  amountCents: z.int(),
  currency: z.literal('USD'),
});
export type Money = z.infer<typeof moneySchema>;

export const moneyRangeSchema = z
  .strictObject({
    minCents: z.int(),
    maxCents: z.int(),
    currency: z.literal('USD'),
  })
  .refine((r) => r.minCents <= r.maxCents, {
    message: 'minCents must not exceed maxCents',
  });
export type MoneyRange = z.infer<typeof moneyRangeSchema>;

/** TR-CONV-04: timestamps are UTC ISO-8601 at every boundary. */
export const isoTimestampSchema = z.iso.datetime();
