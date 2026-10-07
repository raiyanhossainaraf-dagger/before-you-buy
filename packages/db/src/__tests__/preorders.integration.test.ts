import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../client';
import { preorders } from '../schema';
import { countPreorders, recordPaidPreorder, refundPreorderById } from '../repositories/preorders';
import type { PaymentEvent } from '@byb/schemas/preorder';

/** SCHEMA §12, against the real Docker Postgres (`pnpm services:up` first). */
describe('preorders repository (M0.5 integration)', () => {
  const sessionIds: string[] = [];

  afterAll(async () => {
    if (sessionIds.length > 0) {
      await Promise.all(
        sessionIds.map((id) => db().delete(preorders).where(eq(preorders.stripeCheckoutSessionId, id))),
      );
    }
  });

  function freshEvent(): PaymentEvent {
    const sessionId = `mock_cs_${randomUUID()}`;
    sessionIds.push(sessionId);
    return {
      type: 'checkout_completed',
      sessionId,
      paymentIntentId: `mock_pi_${sessionId}`,
      email: `preorder-test-${randomUUID()}@example.com`,
      amountCents: 4_900,
      currency: 'USD',
      offerCode: 'starter_3mo_launch',
    };
  }

  it('is idempotent: delivering the same webhook twice leaves exactly one row', async () => {
    const event = freshEvent();

    const first = await recordPaidPreorder(event);
    const second = await recordPaidPreorder(event);

    expect(first).toBe(true);
    expect(second).toBe(false);

    const rows = await db()
      .select()
      .from(preorders)
      .where(eq(preorders.stripeCheckoutSessionId, event.sessionId));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe('paid');
  });

  it('refunds by the row id and sets refunded_at', async () => {
    const event = freshEvent();
    await recordPaidPreorder(event);
    const [row] = await db()
      .select()
      .from(preorders)
      .where(eq(preorders.stripeCheckoutSessionId, event.sessionId));

    const refunded = await refundPreorderById(row!.id, new Date());

    expect(refunded?.status).toBe('refunded');
    expect(refunded?.refundedAt).not.toBeNull();
  });

  it('refunding an unknown id is a no-op, not an error', async () => {
    const result = await refundPreorderById(randomUUID(), new Date());
    expect(result).toBeNull();
  });

  it('counts paid and refunded rows', async () => {
    const before = await countPreorders();
    const event = freshEvent();
    await recordPaidPreorder(event);

    const after = await countPreorders();
    expect(after.paid).toBe(before.paid + 1);
  });
});
