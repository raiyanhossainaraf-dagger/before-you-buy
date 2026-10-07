import { describe, expect, it } from 'vitest';
import { signMockWebhook, verifyMockWebhookSignature } from './mock-signature';

const SECRET = 'a'.repeat(32);
const OTHER_SECRET = 'b'.repeat(32);

describe('mock webhook signature (M0.5)', () => {
  it('verifies a signature produced with the same secret', () => {
    const body = JSON.stringify({ sessionId: 'mock_cs_1', email: 'a@example.com' });
    const signature = signMockWebhook(body, SECRET);

    expect(verifyMockWebhookSignature(body, signature, SECRET)).toBe(true);
  });

  it('rejects a signature produced with a different secret', () => {
    const body = JSON.stringify({ sessionId: 'mock_cs_1', email: 'a@example.com' });
    const signature = signMockWebhook(body, OTHER_SECRET);

    expect(verifyMockWebhookSignature(body, signature, SECRET)).toBe(false);
  });

  it('rejects a tampered body', () => {
    const body = JSON.stringify({ sessionId: 'mock_cs_1', email: 'a@example.com' });
    const signature = signMockWebhook(body, SECRET);
    const tampered = JSON.stringify({ sessionId: 'mock_cs_1', email: 'attacker@example.com' });

    expect(verifyMockWebhookSignature(tampered, signature, SECRET)).toBe(false);
  });

  it('rejects an empty or malformed signature', () => {
    const body = JSON.stringify({ sessionId: 'mock_cs_1' });

    expect(verifyMockWebhookSignature(body, '', SECRET)).toBe(false);
    expect(verifyMockWebhookSignature(body, 'not-hex', SECRET)).toBe(false);
  });
});
