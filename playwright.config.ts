import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  // Flaky locally with the default auto-detected worker count; keep the CI default.
  workers: process.env.CI ? undefined : 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  // UI §5.4: 375 is the smallest test width and the one the Gate 0 axe/E2E
  // pass runs at; the others are checked by hand per the plan.
  projects: [
    {
      name: 'mobile',
      use: { ...devices['iPhone SE'] },
    },
  ],
  webServer: {
    command: 'pnpm --filter @byb/web start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
