import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signs the mock checkout's webhook body so `/api/payments/webhook` runs the
 * same signature-verification code path for the mock provider as it will for
 * Stripe. Reuses `LINK_SIGNING_SECRET` (already server-only, already a
 * "signing" secret) rather than adding a second one for a local-only provider.
 */
export function signMockWebhook(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

export function verifyMockWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signMockWebhook(rawBody, secret);
  const given = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  return given.length === expectedBuf.length && timingSafeEqual(given, expectedBuf);
}
