import { count, desc, sql } from 'drizzle-orm';
import { db } from '../client';
import { searchInterest } from '../schema';

export type NewSearchInterest = {
  normalizedQuery: string;
  queryType: 'name' | 'url';
  matchedDemo: boolean;
};

export async function recordSearchInterest(input: NewSearchInterest): Promise<void> {
  await db().insert(searchInterest).values(input);
}

/** /admin/gate0: the most-searched normalized queries, most frequent first. */
export async function topQueries(
  limit = 20,
): Promise<Array<{ normalizedQuery: string; total: number; matchedDemo: boolean }>> {
  return db()
    .select({
      normalizedQuery: searchInterest.normalizedQuery,
      total: count(),
      matchedDemo: sql<boolean>`bool_or(${searchInterest.matchedDemo})`,
    })
    .from(searchInterest)
    .groupBy(searchInterest.normalizedQuery)
    .orderBy(desc(count()))
    .limit(limit);
}
