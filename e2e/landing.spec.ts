import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PLANS } from '@byb/config';
import { formatCents } from '@byb/ui';

/** M0.2 — Gate 0 landing page. Structure, not exact copy (see CLAUDE.md M0.2 brief). */
test.describe('Gate 0 landing page', () => {
  test('loads with a visible h1 carrying the positioning claim', async ({ page }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('trusted');
  });

  test('renders the three trust questions', async ({ page }) => {
    await page.goto('/');
    const trustQuestions = page.locator('section', {
      has: page.getByRole('heading', { name: /three questions/i }),
    });
    await expect(trustQuestions.getByText(/reviews real/i)).toBeVisible();
    await expect(trustQuestions.getByText(/discount real/i)).toBeVisible();
    await expect(trustQuestions.getByText(/same unit/i)).toBeVisible();
  });

  test('renders a how-it-works section with three steps', async ({ page }) => {
    await page.goto('/');
    const howItWorks = page.locator('section', { has: page.getByRole('heading', { name: /how it works/i }) });
    await expect(howItWorks.getByRole('listitem')).toHaveCount(3);
  });

  test('pricing preview matches packages/config plans', async ({ page }) => {
    await page.goto('/');
    const pricing = page.locator('#pricing');
    await expect(pricing).toBeVisible();
    for (const plan of PLANS) {
      const card = pricing.locator(`[data-plan="${plan.id}"]`);
      await expect(card.locator('[data-plan-name]')).toHaveText(plan.name);
      const priceText = plan.priceCents === 0 ? 'Free' : `${formatCents(plan.priceCents)}/mo`;
      await expect(card.locator('[data-plan-price]')).toHaveText(priceText);
    }
  });

  test('leaves marked slots for the M0.3 demo, M0.4 email form and M0.5 pre-order card', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-slot="demo-m0-3"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="email-capture-m0-4"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="preorder-m0-5"]')).toHaveCount(1);
  });

  test('footer legal links resolve', async ({ page, request }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    for (const href of ['/privacy', '/terms', '/pre-order-terms', '/affiliate-disclosure']) {
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
      const response = await request.get(href);
      expect(response.ok(), `${href} should resolve`).toBeTruthy();
    }
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('axe reports no serious or critical violations at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
