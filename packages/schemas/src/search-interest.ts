import { z } from 'zod';

/** Gate 0 demand signal (Prompt B item 4): every search, matched or not, no IP, no email. */
export const searchQueryTypeSchema = z.enum(['name', 'url']);
export type SearchQueryType = z.infer<typeof searchQueryTypeSchema>;

export const searchInterestRequestSchema = z.strictObject({
  normalizedQuery: z.string().min(1).max(200),
  queryType: searchQueryTypeSchema,
  matchedDemo: z.boolean(),
});
export type SearchInterestRequest = z.infer<typeof searchInterestRequestSchema>;
