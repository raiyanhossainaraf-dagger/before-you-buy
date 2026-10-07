import { test, expect } from '@playwright/test';

/** M0.7 — Gate 0 dashboard, local only. */
test.describe('Gate 0 dashboard (M0.7)', () => {
  test('is reachable locally and shows signup/pre-order status', async ({ page }) => {
    await page.goto('/admin/gate0');
    await expect(page.getByRole('heading', { name: 'Gate 0 dashboard' })).toBeVisible();
    await expect(page.getByText('Email signups')).toBeVisible();
    await expect(page.getByText('Pre-orders')).toBeVisible();
    await expect(page.getByText(/When does it ship/)).toBeVisible();
  });
});
