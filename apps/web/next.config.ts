import { config } from 'dotenv';
import type { NextConfig } from 'next';

// Next.js only auto-loads .env* from this directory; the monorepo's single
// .env.local lives at the repo root (same pattern as packages/db/drizzle.config.ts).
config({ path: '../../.env.local', quiet: true });

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Workspace packages ship TypeScript source rather than a build step.
  transpilePackages: ['@byb/ui', '@byb/schemas', '@byb/config', '@byb/db', '@byb/email'],

  typedRoutes: true,

  // Full security headers land in M1.4/M1.8 (CSP in report-only first). These
  // are the ones that cost nothing and are wrong to leave off even locally.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
