import { count, desc, eq } from 'drizzle-orm';
import { db } from '../client';
import { preorders } from '../schema';
import type { PaymentEvent } from '@byb/schemas/preorder';

/**
 * M0.5 acceptance criterion: a duplicated webhook delivery must leave exactly
 * one row. The UNIQUE constraint on stripe_checkout_session_id does the work;
 * ON CONFLICT DO NOTHING turns the replay into a no-op instead of an error.
 *
 * Returns true only when this call was the one that created the row, so the
 * caller fires `preorder_paid` once rather than once per delivery.
 */
export async function recordPaidPreorder(event: PaymentEvent): Promise<boolean> {
  const inserted = await db()
    .insert(preorders)
    .values({
      email: event.email,
      stripeCheckoutSessionId: event.sessionId,
      stripePaymentIntentId: event.paymentIntentId,
      amountCents: event.amountCents,
      currency: event.currency,
      offerCode: event.offerCode,
      status: 'paid',
    })
    .onConflictDoNothing({ target: preorders.stripeCheckoutSessionId })
    .returning({ id: preorders.id });

  return inserted.length > 0;
}

export async function markPreorderRefunded(
  sessionId: string,
  now: Date,
): Promise<boolean> {
  const updated = await db()
    .update(preorders)
    .set({ status: 'refunded', refundedAt: now })
    .where(eq(preorders.stripeCheckoutSessionId, sessionId))
    .returning({ id: preorders.id });

  return updated.length > 0;
}

/** `pnpm preorder:refund <id>` (M0.5): refund by the row's own id, not the session id. */
export async function refundPreorderById(id: string, now: Date) {
  const updated = await db()
    .update(preorders)
    .set({ status: 'refunded', refundedAt: now })
    .where(eq(preorders.id, id))
    .returning();

  return updated[0] ?? null;
}

export async function countPreorders(): Promise<{ paid: number; refunded: number }> {
  const rows = await db()
    .select({ status: preorders.status, total: count() })
    .from(preorders)
    .groupBy(preorders.status);

  const byStatus = new Map(rows.map((r) => [r.status, r.total]));
  return { paid: byStatus.get('paid') ?? 0, refunded: byStatus.get('refunded') ?? 0 };
}

/** M0.7 dashboard. Emails are shown only on the local-only admin page. */
export async function listPreorders(limit = 50) {
  return db().select().from(preorders).orderBy(desc(preorders.createdAt)).limit(limit);
}
