import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node only: the logic worth unit-testing here is money formatting and
    // schema validation, neither of which needs a DOM. Component rendering is
    // covered by Playwright instead of a second test runtime.
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts', 'apps/*/lib/**/*.test.ts'],
    // Needs Docker Postgres; run separately via `pnpm test:integration`.
    exclude: ['**/node_modules/**', '**/*.integration.test.ts'],
  },
});
