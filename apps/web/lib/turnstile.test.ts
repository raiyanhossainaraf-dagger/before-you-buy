import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyTurnstileToken } from './turnstile';

describe('verifyTurnstileToken (SEC-30)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns success when Cloudflare says the token is valid', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await verifyTurnstileToken('token', 'secret', '1.2.3.4');

    expect(result).toEqual({ success: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    const sentBody = new URLSearchParams(init.body as string);
    expect(sentBody.get('secret')).toBe('secret');
    expect(sentBody.get('response')).toBe('token');
    expect(sentBody.get('remoteip')).toBe('1.2.3.4');
  });

  it('returns failure with error codes when Cloudflare rejects the token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
      }),
    );

    const result = await verifyTurnstileToken('token', 'secret');

    expect(result).toEqual({ success: false, errorCodes: ['timeout-or-duplicate'] });
  });

  it('treats a network/parse failure as a failed verification, not a thrown error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const result = await verifyTurnstileToken('token', 'secret');

    expect(result).toEqual({ success: false, errorCodes: ['network_error'] });
  });
});
