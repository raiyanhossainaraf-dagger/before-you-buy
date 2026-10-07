import { createHmac, timingSafeEqual } from 'node:crypto';

type TokenPayload = { id: string; exp: number };

function sign(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

/**
 * Signed, expiring link token for the waitlist double opt-in (SCHEMA §12
 * `confirmed_at`). `secret` is `LINK_SIGNING_SECRET`; time is passed in so
 * this stays pure (no I/O, no Date.now()).
 */
export function createConfirmToken(id: string, secret: string, now: Date, ttlMs: number): string {
  const payload: TokenPayload = { id, exp: now.getTime() + ttlMs };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encoded}.${sign(encoded, secret)}`;
}

export type VerifyConfirmTokenResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'invalid' | 'expired' };

export function verifyConfirmToken(
  token: string,
  secret: string,
  now: Date,
): VerifyConfirmTokenResult {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return { ok: false, reason: 'invalid' };

  const expectedSignature = sign(encoded, secret);
  const given = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: 'invalid' };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  if (typeof payload.id !== 'string' || typeof payload.exp !== 'number') {
    return { ok: false, reason: 'invalid' };
  }

  if (now.getTime() > payload.exp) return { ok: false, reason: 'expired' };

  return { ok: true, id: payload.id };
}
