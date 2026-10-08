import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** DEC-038 — Gate 0 home page: hero, trust questions and the live demo only. */
test.describe('Home page', () => {
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

  test('leaves the marked slot for the M0.3 demo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-slot="demo-m0-3"]')).toHaveCount(1);
  });

  test('CTAs link to /pricing and /notify instead of inline forms', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'See pricing' })).toHaveAttribute(
      'href',
      '/pricing',
    );
    await expect(page.getByRole('link', { name: 'Get notified' }).last()).toHaveAttribute(
      'href',
      '/notify',
    );
  });

  test('global header and footer are present', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('header').getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy' })).toBeVisible();
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

/**
 * Prompt B — the mobile menu is a native `<details>`/`<summary>` disclosure
 * (no checkbox, no client JS). Checked on an inner page, since the hero's
 * own combobox occupies "Pricing"-adjacent space on home.
 */
test.describe('Header mobile menu (details/summary disclosure)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('menu links are hidden until the summary is activated, then reachable', async ({ page }) => {
    await page.goto('/pricing');
    const nav = page.locator('header details nav[aria-label="Primary"]');
    await expect(nav).toBeHidden();

    await page.locator('header details summary').click();
    await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Get notified' })).toBeVisible();
  });

  test('is operable by keyboard alone (Tab to the toggle, Enter to open)', async ({ page }) => {
    await page.goto('/pricing');
    const toggle = page.locator('header details summary');
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(
      page.locator('header details nav[aria-label="Primary"]').getByRole('link', { name: 'Pricing' }),
    ).toBeVisible();
  });

  test('axe reports no serious or critical violations with the menu open at 375px', async ({ page }) => {
    await page.goto('/pricing');
    await page.locator('header details summary').click();
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

/** DEC-038 — /pricing: plan cards from packages/config, pre-order offer, credits FAQ. */
test.describe('Pricing page', () => {
  test('loads with a visible h1', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { level: 1, name: 'Plans' })).toBeVisible();
  });

  test('pricing cards match packages/config plans', async ({ page }) => {
    const { PLANS } = await import('@byb/config');
    const { formatCents } = await import('@byb/ui');
    await page.goto('/pricing');
    for (const plan of PLANS) {
      const card = page.locator(`[data-plan="${plan.id}"]`);
      await expect(card.locator('[data-plan-name]')).toHaveText(plan.name);
      const priceText = plan.priceCents === 0 ? 'Free' : `${formatCents(plan.priceCents)}/mo`;
      await expect(card.locator('[data-plan-price]')).toHaveText(priceText);
    }
  });

  test('shows the Enterprise line and the founding pre-order offer', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Enterprise', { exact: false })).toBeVisible();
    await expect(page.getByText('Founding offer')).toBeVisible();
  });

  test('pricing card CTA buttons sit at the same top offset on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/pricing');
    const cards = await page.locator('[data-plan]').all();
    const boxes = await Promise.all(
      cards.map(async (card) => {
        const box = await card.getByRole('link', { name: 'Get started' }).boundingBox();
        return box!.y;
      }),
    );
    expect(boxes.length).toBeGreaterThan(0);
    for (const y of boxes) {
      expect(Math.abs(y - boxes[0]!)).toBeLessThanOrEqual(1);
    }
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pricing');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('axe reports no serious or critical violations at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/pricing');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

/** DEC-038/039 — /notify: waitlist form, "what you'll get", ?q= personalization. */
test.describe('Notify page', () => {
  test('loads with a visible h1', async ({ page }) => {
    await page.goto('/notify');
    await expect(page.getByRole('heading', { level: 1, name: 'Get notified at launch' })).toBeVisible();
  });

  test('?q= personalizes the heading', async ({ page }) => {
    await page.goto('/notify?q=sony%20headphones');
    await expect(
      page.getByRole('heading', { level: 1, name: /sony headphones/i }),
    ).toBeVisible();
  });

  test('axe reports no serious or critical violations at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/notify');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('axe reports no serious or critical violations at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/notify');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
