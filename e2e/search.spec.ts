import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Prompt B item 3 — /search matches the 3 demo products or shows an honest preview. */
test.describe('/search', () => {
  test('a demo-matching query shows the real comparison, not a placeholder', async ({ page }) => {
    await page.goto('/search?q=sony+wh-1000xm5');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sony');
    await expect(page.locator('[data-slot="demo-m0-3"]')).toHaveCount(1);
    const cards = page.locator('article[data-listing-id]');
    await expect(cards).toHaveCount(3);
  });

  test('a non-matching query shows an honest "not live yet" preview with a /notify CTA', async ({
    page,
  }) => {
    await page.goto('/search?q=playstation+5+console');
    await expect(page.getByRole('heading', { name: "We're not live yet" })).toBeVisible();
    const cta = page.getByRole('link', { name: /get notified/i });
    await expect(cta).toHaveAttribute('href', '/notify?q=playstation%205%20console');
  });

  test('pasting a short link shows the friendly short-link message, never a fake result', async ({
    page,
  }) => {
    await page.goto('/search?q=https%3A%2F%2Famzn.to%2F3xyzabc');
    await expect(page.getByRole('heading', { name: "Short links can't be checked" })).toBeVisible();
    await expect(page.getByText(/open the product and copy the full link/i)).toBeVisible();
  });

  test('pasting a full Amazon link that is not one of the 3 demo products shows the honest preview', async ({
    page,
  }) => {
    await page.goto('/search?q=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB000000000');
    await expect(page.getByRole('heading', { name: "We're not live yet" })).toBeVisible();
  });

  test('an empty query shows a prompt instead of a blank page', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('heading', { name: 'Search for a product' })).toBeVisible();
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/search?q=sony+wh-1000xm5');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

test.describe('Hero search combobox', () => {
  test('suggests only the 3 demo products after 2 characters, and navigates to /search on pick', async ({
    page,
  }) => {
    await page.goto('/');
    const input = page.getByRole('combobox', { name: 'Search a product' });
    await input.click();
    await input.pressSequentially('so');
    const option = page.getByRole('option', { name: /Sony WH-1000XM5/i });
    await expect(option).toBeVisible();
    await option.click();
    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sony');
  });

  test('shows no suggestions below 2 characters', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('combobox', { name: 'Search a product' });
    await input.click();
    await input.pressSequentially('s');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });
});
