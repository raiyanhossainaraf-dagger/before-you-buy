import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const MAILPIT_URL = 'http://localhost:8025';

/** Polls Mailpit's REST API until a receipt for `email` arrives. */
async function findReceipt(email: string, timeoutMs = 15_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const search = await fetch(`${MAILPIT_URL}/api/v1/search?query=to:${encodeURIComponent(email)}`);
    const { messages } = (await search.json()) as { messages: Array<{ ID: string }> };
    if (messages.length > 0) {
      const detail = await fetch(`${MAILPIT_URL}/api/v1/message/${messages[0]!.ID}`);
      const { Text } = (await detail.json()) as { Text: string };
      return Text;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No receipt arrived for ${email} within ${timeoutMs}ms`);
}

/** M0.5 — refundable pre-orders via the mock payment provider. */
test.describe('M0.5 pre-orders', () => {
  test('reserve, pay via the mock checkout, land on success, and receive a receipt', async ({
    page,
  }) => {
    const email = `e2e-preorder-${Date.now()}@example.com`;

    await page.goto('/');
    await page.locator('[data-slot="preorder-m0-5"]').getByLabel('Email').fill(email);

    const reserveButton = page.getByRole('button', { name: 'Reserve my spot' });
    await expect(reserveButton).toBeEnabled({ timeout: 15_000 });
    await reserveButton.click();

    await expect(page).toHaveURL(/\/checkout\/mock\?/);
    await expect(page.getByText('Test checkout — no real payment')).toBeVisible();

    await page.getByRole('button', { name: /^Pay/ }).click();

    await expect(page).toHaveURL(/\/preorder\/success/);
    await expect(page.getByRole('heading', { name: "You're pre-ordered" })).toBeVisible();

    const receipt = await findReceipt(email);
    expect(receipt).toContain('$49.00');
  });

  test('canceling the mock checkout charges nothing', async ({ page }) => {
    const email = `e2e-preorder-cancel-${Date.now()}@example.com`;

    await page.goto('/');
    await page.locator('[data-slot="preorder-m0-5"]').getByLabel('Email').fill(email);
    const reserveButton = page.getByRole('button', { name: 'Reserve my spot' });
    await expect(reserveButton).toBeEnabled({ timeout: 15_000 });
    await reserveButton.click();

    await expect(page).toHaveURL(/\/checkout\/mock\?/);
    await page.getByRole('link', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/preorder\/cancel/);
    await expect(page.getByRole('heading', { name: 'No charge made' })).toBeVisible();
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .include('[data-slot="preorder-m0-5"]')
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
