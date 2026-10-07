import { NextResponse } from 'next/server';
import { preorderCheckoutRequestSchema } from '@byb/schemas/preorder';
import { serverEnv } from '@byb/config/server';
import { PREORDER_OFFER } from '@byb/config';
import { getPaymentProvider } from '@/lib/payments';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { track } from '@/lib/analytics';

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = preorderCheckoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  const now = Date.now();
  const ip = clientIp(req);

  // Same shape as the waitlist route (SEC-13): 3/email/15min, 10/IP/15min.
  const emailAllowed = checkRateLimit(`preorder:email:${parsed.data.email.toLowerCase()}`, 3, 15 * 60_000, now);
  const ipAllowed = checkRateLimit(`preorder:ip:${ip}`, 10, 15 * 60_000, now);
  if (!emailAllowed || !ipAllowed) {
    return NextResponse.json(
      { ok: false, message: 'Too many requests. Try again later.' },
      { status: 429 },
    );
  }

  const env = serverEnv();
  const verification = await verifyTurnstileToken(parsed.data.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
  if (!verification.success) {
    return NextResponse.json(
      { ok: false, message: 'Verification failed. Please try again.' },
      { status: 400 },
    );
  }

  try {
    const { checkoutUrl, sessionId } = await getPaymentProvider().createCheckout(
      parsed.data.email,
      PREORDER_OFFER.code,
    );
    track({ name: 'preorder_started', props: {} });
    return NextResponse.json({ checkoutUrl, sessionId });
  } catch (err) {
    console.error('[preorder] checkout creation failed', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
