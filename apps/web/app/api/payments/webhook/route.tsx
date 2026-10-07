import { NextResponse } from 'next/server';
import { preorderRepo } from '@byb/db';
import { PREORDER_OFFER, SENDER_IDENTITY } from '@byb/config';
import { sendEmail } from '@byb/email';
import { PreorderReceipt } from '@byb/email/templates/preorder-receipt';
import { serverEnv } from '@byb/config/server';
import { getPaymentProvider } from '@/lib/payments';
import { track } from '@/lib/analytics';

/**
 * One handler for both providers (SEC-70): `parseWebhook` verifies the
 * signature and normalizes to `PaymentEvent` before this ever sees the body.
 * `recordPaidPreorder`'s UNIQUE constraint on `stripe_checkout_session_id`
 * makes a duplicated delivery a no-op — `created` is only true the first time,
 * so the receipt email and `preorder_paid` fire exactly once (TR-BILL-03).
 */
export async function POST(req: Request) {
  const rawBody = await req.text();

  let event;
  try {
    event = await getPaymentProvider().parseWebhook(rawBody, req.headers);
  } catch (err) {
    console.error('[payments] webhook verification failed', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (event.type === 'checkout_completed') {
    const created = await preorderRepo.recordPaidPreorder(event);
    if (created) {
      track({ name: 'preorder_paid', props: { amountCents: event.amountCents, offerCode: event.offerCode } });
      await sendEmail({
        to: event.email,
        subject: "You're pre-ordered — Before You Buy",
        react: (
          <PreorderReceipt
            amountCents={event.amountCents}
            offerTitle={PREORDER_OFFER.title}
            refundTerms={PREORDER_OFFER.refundTerms}
            termsUrl={`${serverEnv().WEB_ORIGIN}/pre-order-terms`}
            senderAddress={SENDER_IDENTITY}
          />
        ),
      });
    }
  }
  // 'refunded' events are not produced by either provider yet (see TR-BILL-07:
  // Stripe refunds are handled in the dashboard; mock refunds go through the
  // preorder:refund script instead). 'ignored' events are dropped here too.

  return NextResponse.json({ ok: true });
}
