import { and, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { db } from '../client';
import { waitlistSignups } from '../schema';
import type { Utm } from '@byb/schemas/waitlist';

export type NewSignup = {
  email: string;
  source: string;
  utm?: Utm;
  referrer?: string;
  query?: string;
  consentTextVersion: string;
};

export type SignupUpsert = {
  id: string;
  /** True when this address was already on the list before this request. */
  existed: boolean;
  alreadyConfirmed: boolean;
};

/**
 * Idempotent by email (SCHEMA §12 UNIQUE). Signing up twice must not create a
 * second row, and the caller gets enough back to decide whether to re-send the
 * confirmation email — without the response ever revealing which case it was
 * (SEC-13 enumeration safety is the caller's job).
 */
export async function upsertSignup(input: NewSignup): Promise<SignupUpsert> {
  const inserted = await db()
    .insert(waitlistSignups)
    .values({
      email: input.email,
      source: input.source,
      utm: input.utm,
      referrer: input.referrer,
      query: input.query,
      consentTextVersion: input.consentTextVersion,
    })
    .onConflictDoNothing({ target: waitlistSignups.email })
    .returning({ id: waitlistSignups.id });

  const row = inserted[0];
  if (row) return { id: row.id, existed: false, alreadyConfirmed: false };

  const existing = await db()
    .select({ id: waitlistSignups.id, confirmedAt: waitlistSignups.confirmedAt })
    .from(waitlistSignups)
    .where(eq(waitlistSignups.email, input.email))
    .limit(1);

  const found = existing[0];
  if (!found) throw new Error('waitlist upsert neither inserted nor found a row');

  return { id: found.id, existed: true, alreadyConfirmed: found.confirmedAt !== null };
}

/** Returns false when the token was already used, so replay is a no-op. */
export async function confirmSignup(id: string, now: Date): Promise<boolean> {
  const updated = await db()
    .update(waitlistSignups)
    .set({ confirmedAt: now })
    .where(and(eq(waitlistSignups.id, id), isNull(waitlistSignups.confirmedAt)))
    .returning({ id: waitlistSignups.id });

  return updated.length > 0;
}

export async function findSignup(id: string) {
  const rows = await db()
    .select()
    .from(waitlistSignups)
    .where(eq(waitlistSignups.id, id))
    .limit(1);
  return rows[0];
}

/** M0.7 dashboard: signups by source. */
export async function countSignupsBySource(): Promise<
  Array<{ source: string; total: number; confirmed: number }>
> {
  return db()
    .select({
      source: sql<string>`coalesce(${waitlistSignups.source}, 'unknown')`,
      total: count(),
      confirmed: sql<number>`count(${waitlistSignups.confirmedAt})::int`,
    })
    .from(waitlistSignups)
    .groupBy(sql`coalesce(${waitlistSignups.source}, 'unknown')`)
    .orderBy(desc(count()));
}

export async function countSignups(): Promise<{ total: number; confirmed: number }> {
  const [totals] = await db().select({ total: count() }).from(waitlistSignups);
  const [confirmed] = await db()
    .select({ total: count() })
    .from(waitlistSignups)
    .where(isNotNull(waitlistSignups.confirmedAt));

  return { total: totals?.total ?? 0, confirmed: confirmed?.total ?? 0 };
}

/** M0.7 dashboard: signups per calendar day (UTC), oldest first. */
export async function signupsByDay(): Promise<Array<{ day: string; total: number }>> {
  const rows = await db()
    .select({
      day: sql<string>`to_char(${waitlistSignups.createdAt}, 'YYYY-MM-DD')`,
      total: count(),
    })
    .from(waitlistSignups)
    .groupBy(sql`to_char(${waitlistSignups.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${waitlistSignups.createdAt}, 'YYYY-MM-DD')`);

  return rows;
}
