import { config } from 'dotenv';

config({ path: '../../.env.local', quiet: true });

/**
 * Gate 0 has nothing to seed: the two tables hold only real visitor input, and
 * the demo comparisons are files under apps/web/content/demo, not rows
 * (M0.3). The script exists so `pnpm db:seed` is wired from M0 and M2.6 only
 * has to fill in the body.
 */
console.log('Nothing to seed for Gate 0 (plans and demo products arrive in M2.6).');
