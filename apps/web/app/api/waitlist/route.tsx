import { NextResponse } from 'next/server';
import { waitlistRepo } from '@byb/db';
import { waitlistSignupRequestSchema } from '@byb/schemas/waitlist';
import { serverEnv } from '@byb/config/server';
import { CONSENT, SENDER_IDENTITY } from '@byb/config';
import { createConfirmToken } from '@byb/core';
import { sendEmail } from '@byb/email';
import { WaitlistConfirm } from '@byb/email/templates/waitlist-confirm';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { track } from '@/lib/analytics';

const CONFIRM_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

// SEC-13: the response never reveals whether the address was already on the
// list, so this is returned for every outcome except malformed input.
const ENUMERATION_SAFE_RESPONSE = {
  ok: true as const,
  message: "Check your inbox — we've sent a confirmation link.",
};

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = waitlistSignupRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  const now = Date.now();
  const ip = clientIp(req);

  // SEC-13: 3 per email per 15 min, 10 per IP per 15 min.
  const emailAllowed = checkRateLimit(
    `waitlist:email:${parsed.data.email.toLowerCase()}`,
    3,
    15 * 60_000,
    now,
  );
  const ipAllowed = checkRateLimit(`waitlist:ip:${ip}`, 10, 15 * 60_000, now);
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
    const signup = await waitlistRepo.upsertSignup({
      email: parsed.data.email,
      source: parsed.data.source,
      consentTextVersion: CONSENT.version,
      ...(parsed.data.utm ? { utm: parsed.data.utm } : {}),
      ...(parsed.data.referrer ? { referrer: parsed.data.referrer } : {}),
      ...(parsed.data.query ? { query: parsed.data.query } : {}),
    });

    if (!signup.alreadyConfirmed) {
      const token = createConfirmToken(signup.id, env.LINK_SIGNING_SECRET, new Date(now), CONFIRM_TOKEN_TTL_MS);
      // SEC-14: built from the configured origin, never the request Host header.
      const confirmUrl = `${env.WEB_ORIGIN}/api/waitlist/confirm?token=${encodeURIComponent(token)}`;

      await sendEmail({
        to: parsed.data.email,
        subject: 'Confirm your spot on the Before You Buy waitlist',
        react: <WaitlistConfirm confirmUrl={confirmUrl} senderAddress={SENDER_IDENTITY} />,
      });
    }

    if (!signup.existed) {
      track({ name: 'waitlist_signed_up', props: { source: parsed.data.source } });
    }
  } catch (err) {
    // SEC-51: never log the email itself.
    console.error('[waitlist] signup failed', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json(ENUMERATION_SAFE_RESPONSE);
}
