import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isLocal, serverEnv } from '@byb/config/server';
import { signMockWebhook } from '@/lib/payments/mock-signature';
import { MOCK_SIGNATURE_HEADER } from '@/lib/payments/mock';

const mockPayFormSchema = z.strictObject({
  session: z.string().min(1).max(200),
  email: z.email().max(254),
  offer: z.string().min(1).max(60),
  amount: z.coerce.number().int().min(0),
});

/**
 * The mock checkout's "Pay" button posts here. Signing happens server-side
 * (the secret can't reach the client bundle, rule 13) and this then calls
 * `/api/payments/webhook` — the exact route Stripe would call — so that
 * handler's signature check and idempotency logic run for real, not a stub.
 */
export async function POST(req: Request) {
  const env = serverEnv();
  if (!isLocal() || env.PAYMENTS_PROVIDER !== 'mock') {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const form = await req.formData();
  const parsed = mockPayFormSchema.safeParse({
    session: form.get('session'),
    email: form.get('email'),
    offer: form.get('offer'),
    amount: form.get('amount'),
  });
  if (!parsed.success) {
    return NextResponse.redirect(new URL('/preorder/cancel', env.WEB_ORIGIN), 303);
  }

  const rawBody = JSON.stringify({
    sessionId: parsed.data.session,
    email: parsed.data.email,
    amountCents: parsed.data.amount,
    offerCode: parsed.data.offer,
  });
  const signature = signMockWebhook(rawBody, env.LINK_SIGNING_SECRET);

  const webhookRes = await fetch(`${env.WEB_ORIGIN}/api/payments/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', [MOCK_SIGNATURE_HEADER]: signature },
    body: rawBody,
  });

  if (!webhookRes.ok) {
    return NextResponse.redirect(new URL('/preorder/cancel', env.WEB_ORIGIN), 303);
  }

  const successUrl = new URL('/preorder/success', env.WEB_ORIGIN);
  successUrl.searchParams.set('session', parsed.data.session);
  return NextResponse.redirect(successUrl, 303);
}
