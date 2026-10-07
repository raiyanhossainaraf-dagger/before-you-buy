import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

config({ path: '.env.local', quiet: true });

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/*/src/**/*.integration.test.ts'],
    // DB round-trips serialize against one real Postgres, unlike the unit suite.
    fileParallelism: false,
  },
});
