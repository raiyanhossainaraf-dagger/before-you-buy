import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** M0.6 — legal page drafts, each marked pending legal review. */
test.describe('Legal page drafts (M0.6)', () => {
  for (const path of ['/privacy', '/terms', '/affiliate-disclosure', '/pre-order-terms']) {
    test(`${path} shows the draft banner`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText('Draft — pending legal review')).toBeVisible();
    });
  }

  test('privacy policy names what is actually collected today', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText('Email address')).toBeVisible();
    await expect(page.getByText('Turnstile verification')).toBeVisible();
  });

  test('affiliate disclosure notes no affiliate links are live yet', async ({ page }) => {
    await page.goto('/affiliate-disclosure');
    await expect(page.getByText(/no affiliate links are live/i)).toBeVisible();
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/privacy');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
