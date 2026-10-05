import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * M0.3 demo picker — exercised against the dev fixture harness
 * (/dev/demo-preview), not the real content/demo/*.json files, which hold
 * TODOs until hand-filled from actual retailer checkouts.
 */
test.describe('M0.3 demo picker', () => {
  test('each demo tab renders 3 cards with condition, landed price and the example label', async ({ page }) => {
    await page.goto('/dev/demo-preview');
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(3);

    for (const tab of await tabs.all()) {
      await tab.click();
      const cards = page.locator('article[data-listing-id]');
      await expect(cards).toHaveCount(3);

      for (const card of await cards.all()) {
        await expect(card).toHaveAttribute('data-condition', /.+/);
        await expect(card.locator('.text-2xl').getByText(/^\$\d/)).toBeVisible();
        await expect(card.getByText('Example analysis', { exact: false }).first()).toBeVisible();
      }
    }
  });

  test('shows "Sample captured on" and disables outbound links', async ({ page }) => {
    await page.goto('/dev/demo-preview');
    await expect(page.getByText(/Sample captured on/)).toBeVisible();
    const disabledLinks = page.getByRole('button', { name: 'Links available at launch' });
    await expect(disabledLinks).toHaveCount(3);
    for (const link of await disabledLinks.all()) {
      await expect(link).toBeDisabled();
    }
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dev/demo-preview');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
