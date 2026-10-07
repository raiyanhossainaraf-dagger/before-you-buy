const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileVerifyResult =
  | { success: true }
  | { success: false; errorCodes: string[] };

/**
 * SEC-30: server-side verification of the widget's response token. Called for
 * real even with Cloudflare's documented always-pass test keys (TURNSTILE_SECRET_KEY
 * in .env.example) — only the keys are fake, the HTTP call is not.
 *
 * challenges.cloudflare.com is the one new outbound host this change adds;
 * there is no host-allowlist mechanism yet (that lands with the provider
 * framework in M4), so this is the SEC-41 PR-checklist note instead of a code change.
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const json = (await res.json()) as { success: boolean; 'error-codes'?: string[] };

    if (json.success) return { success: true };
    return { success: false, errorCodes: json['error-codes'] ?? [] };
  } catch {
    return { success: false, errorCodes: ['network_error'] };
  }
}
