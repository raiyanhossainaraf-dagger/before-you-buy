import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../client';
import { searchInterest } from '../schema';
import { recordSearchInterest, topQueries } from '../repositories/search-interest';

/** Prompt B item 4, against the real Docker Postgres (`pnpm services:up` first). */
describe('search-interest repository (integration)', () => {
  const queries: string[] = [];

  afterAll(async () => {
    if (queries.length > 0) {
      await Promise.all(
        queries.map((q) =>
          db().delete(searchInterest).where(eq(searchInterest.normalizedQuery, q)),
        ),
      );
    }
  });

  function freshQuery() {
    const q = `test query ${randomUUID()}`;
    queries.push(q);
    return q;
  }

  it('records a row with no IP/email columns to leak', async () => {
    const normalizedQuery = freshQuery();
    await recordSearchInterest({ normalizedQuery, queryType: 'name', matchedDemo: true });

    const rows = await db()
      .select()
      .from(searchInterest)
      .where(eq(searchInterest.normalizedQuery, normalizedQuery));

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ normalizedQuery, queryType: 'name', matchedDemo: true });
    expect(rows[0]).not.toHaveProperty('ip');
    expect(rows[0]).not.toHaveProperty('email');
  });

  it('topQueries counts repeats of the same normalized query and reports whether it matched a demo', async () => {
    const normalizedQuery = freshQuery();
    await recordSearchInterest({ normalizedQuery, queryType: 'name', matchedDemo: false });
    await recordSearchInterest({ normalizedQuery, queryType: 'name', matchedDemo: true });

    const top = await topQueries(50);
    const row = top.find((r) => r.normalizedQuery === normalizedQuery);

    expect(row).toMatchObject({ normalizedQuery, total: 2, matchedDemo: true });
  });
});
