import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Prompt B item 5 — final sign-in layout, disabled, no fake login. */
test.describe('/sign-in', () => {
  test('shows the final layout, fully disabled, with no working submit', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Continue with email' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Continue with passkey' })).toBeDisabled();
  });

  test('offers /notify instead of a working account flow', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByText('Accounts open at launch — get notified')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get notified' })).toHaveAttribute('href', '/notify');
  });

  test('the header "Sign in" link reaches this page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/sign-in');
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/sign-in');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
