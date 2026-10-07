import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../client';
import { waitlistSignups } from '../schema';
import { confirmSignup, findSignup, signupsByDay, upsertSignup } from '../repositories/waitlist';

/** SCHEMA §12, against the real Docker Postgres (`pnpm services:up` first). */
describe('waitlist repository (M0.4 integration)', () => {
  const emails: string[] = [];

  afterAll(async () => {
    if (emails.length > 0) {
      await Promise.all(
        emails.map((email) => db().delete(waitlistSignups).where(eq(waitlistSignups.email, email))),
      );
    }
  });

  function freshEmail() {
    const email = `waitlist-test-${randomUUID()}@example.com`;
    emails.push(email);
    return email;
  }

  it('is idempotent: signing up twice does not create a second row', async () => {
    const email = freshEmail();

    const first = await upsertSignup({ email, source: 'direct', consentTextVersion: 'v1' });
    const second = await upsertSignup({ email, source: 'direct', consentTextVersion: 'v1' });

    expect(first.existed).toBe(false);
    expect(second.existed).toBe(true);
    expect(second.id).toBe(first.id);
  });

  it('confirms a signup exactly once; replay is a no-op', async () => {
    const email = freshEmail();
    const { id } = await upsertSignup({ email, source: 'direct', consentTextVersion: 'v1' });

    const changedFirst = await confirmSignup(id, new Date());
    const changedSecond = await confirmSignup(id, new Date());

    expect(changedFirst).toBe(true);
    expect(changedSecond).toBe(false);

    const row = await findSignup(id);
    expect(row?.confirmedAt).not.toBeNull();
  });

  it('counts signups by day (M0.7 Gate 0 dashboard)', async () => {
    const email = freshEmail();
    await upsertSignup({ email, source: 'direct', consentTextVersion: 'v1' });

    const today = new Date().toISOString().slice(0, 10);
    const rows = await signupsByDay();
    const todayRow = rows.find((r) => r.day === today);

    expect(todayRow).toBeDefined();
    expect(todayRow!.total).toBeGreaterThanOrEqual(1);
  });

  it('is case-insensitive on email (citext)', async () => {
    const email = freshEmail();
    await upsertSignup({ email, source: 'direct', consentTextVersion: 'v1' });

    const upper = await upsertSignup({
      email: email.toUpperCase(),
      source: 'direct',
      consentTextVersion: 'v1',
    });

    expect(upper.existed).toBe(true);
  });
});
