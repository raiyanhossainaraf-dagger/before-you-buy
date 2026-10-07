import { describe, expect, it } from 'vitest';
import { createConfirmToken, verifyConfirmToken } from '../confirm-token';

const SECRET = 'a'.repeat(32);
const OTHER_SECRET = 'b'.repeat(32);

describe('confirm token (waitlist double opt-in, M0.4)', () => {
  it('round-trips a freshly created token', () => {
    const now = new Date('2026-10-08T00:00:00Z');
    const token = createConfirmToken('signup-id-1', SECRET, now, 60_000);

    const result = verifyConfirmToken(token, SECRET, now);

    expect(result).toEqual({ ok: true, id: 'signup-id-1' });
  });

  it('rejects a token past its expiry', () => {
    const now = new Date('2026-10-08T00:00:00Z');
    const token = createConfirmToken('signup-id-1', SECRET, now, 60_000);

    const later = new Date(now.getTime() + 60_001);
    const result = verifyConfirmToken(token, SECRET, later);

    expect(result).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects a token signed with a different secret', () => {
    const now = new Date('2026-10-08T00:00:00Z');
    const token = createConfirmToken('signup-id-1', SECRET, now, 60_000);

    const result = verifyConfirmToken(token, OTHER_SECRET, now);

    expect(result).toEqual({ ok: false, reason: 'invalid' });
  });

  it('rejects a tampered payload', () => {
    const now = new Date('2026-10-08T00:00:00Z');
    const token = createConfirmToken('signup-id-1', SECRET, now, 60_000);
    const [encoded, signature] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ id: 'someone-elses-id', exp: now.getTime() + 60_000 }),
    ).toString('base64url');
    const tampered = `${tamperedPayload}.${signature}`;

    const result = verifyConfirmToken(tampered, SECRET, now);

    expect(result).toEqual({ ok: false, reason: 'invalid' });
    expect(encoded).not.toBe(tamperedPayload);
  });

  it('rejects garbage input', () => {
    const now = new Date('2026-10-08T00:00:00Z');

    expect(verifyConfirmToken('not-a-token', SECRET, now)).toEqual({
      ok: false,
      reason: 'invalid',
    });
    expect(verifyConfirmToken('', SECRET, now)).toEqual({ ok: false, reason: 'invalid' });
  });
});
