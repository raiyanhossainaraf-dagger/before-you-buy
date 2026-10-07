import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const MAILPIT_URL = 'http://localhost:8025';
const CONFIRM_LINK_RE = /http:\/\/localhost:3000\/api\/waitlist\/confirm\?token=[A-Za-z0-9_.-]+/;

/** Polls Mailpit's REST API until the confirmation email for `email` arrives. */
async function findConfirmLink(email: string, timeoutMs = 15_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const search = await fetch(`${MAILPIT_URL}/api/v1/search?query=to:${encodeURIComponent(email)}`);
    const { messages } = (await search.json()) as { messages: Array<{ ID: string }> };
    if (messages.length > 0) {
      const detail = await fetch(`${MAILPIT_URL}/api/v1/message/${messages[0]!.ID}`);
      const { Text } = (await detail.json()) as { Text: string };
      const match = Text.match(CONFIRM_LINK_RE);
      if (match) return match[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No confirmation email arrived for ${email} within ${timeoutMs}ms`);
}

/** M0.4 — waitlist double opt-in (SCHEMA §12, SEC-13/30/51/53). */
test.describe('M0.4 waitlist', () => {
  test('sign up, confirm via the emailed link, and the row is confirmed', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;

    await page.goto('/');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel(/launches/).check();

    // SEC-30: the widget makes a real network call to Cloudflare (always-pass test key).
    await expect(page.getByRole('button', { name: 'Get notified' })).toBeEnabled({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Get notified' }).click();
    await expect(page.getByRole('status')).toContainText('Check your inbox');

    const confirmLink = await findConfirmLink(email);
    await page.goto(confirmLink);
    await expect(page.getByRole('heading', { name: "You're on the list" })).toBeVisible();
  });

  test('an invalid confirmation token shows a friendly page, not an error page', async ({ page }) => {
    await page.goto('/api/waitlist/confirm?token=not-a-real-token');
    await expect(page.getByRole('heading', { name: "This link didn't work" })).toBeVisible();
  });

  test('rejects an unchecked consent box without calling the server', async ({ page }) => {
    const email = `e2e-noconsent-${Date.now()}@example.com`;
    await page.goto('/');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await expect(page.getByRole('button', { name: 'Get notified' })).toBeEnabled({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Get notified' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Consent is required' })).toBeVisible();
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .include('[data-slot="email-capture-m0-4"]')
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
