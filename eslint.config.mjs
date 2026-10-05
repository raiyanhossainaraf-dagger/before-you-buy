// @ts-check
import nextPlugin from 'eslint-config-next';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

/**
 * ARCH §6.1 dependency rules, enforced by lint rather than only by convention:
 *   - apps/web must not import packages/{db,providers,ai} or server secrets.
 *   - packages/** never import apps/**.
 * The one override is the M0 exception (DEC-031): Next.js route handlers and
 * the local-only admin page write straight through packages/db until M1.9
 * moves those writes behind the API.
 */
const webBoundary = {
  files: ['apps/web/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@byb/db', '@byb/db/*', 'providers', 'providers/*', '@byb/ai', '@byb/ai/*'],
            message:
              'apps/web must not import db, providers or ai directly (ARCH §6.1). ' +
              'Route handlers get the DEC-031 override below; everything else waits for M1.9.',
          },
        ],
      },
    ],
  },
};

const webBoundaryOverride = {
  // DEC-031: remove this override in M1.9 once writes move behind the API.
  files: ['apps/web/app/api/**/*.{ts,tsx}', 'apps/web/app/admin/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': 'off',
  },
};

const packagesBoundary = {
  files: ['packages/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [{ group: ['@byb/web', '@/*'], message: 'packages must not import apps.' }],
      },
    ],
  },
};

const noDangerousHtml = {
  files: ['**/*.{ts,tsx}'],
  plugins: { react: reactPlugin },
  rules: {
    'react/no-danger': 'error',
  },
};

/**
 * UI §9.2 forbidden-words list, enforced as a lint rule rather than relying on
 * someone remembering to grep before shipping copy.
 */
const FORBIDDEN_WORDS = [
  'fake',
  'fraud',
  'scam',
  'guaranteed',
  '100%',
  'lowest price ever',
  'best price guarantee',
  'scraped',
];

const copyRules = {
  files: ['apps/web/app/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      ...FORBIDDEN_WORDS.map((word) => ({
        selector: `Literal[value=/${word}/i]`,
        message: `UI §9.2: "${word}" is a forbidden word in product copy.`,
      })),
    ],
  },
};

// eslint-config-next's rules (no-head-element, no-html-link-for-pages, etc.)
// assume a Next.js app; scope them to apps/web so they don't fire on
// packages/email's plain-HTML render target or other non-Next code.
const nextConfigScopedToWeb = nextPlugin.map((entry) =>
  entry.rules ? { ...entry, files: ['apps/web/**/*.{js,jsx,ts,tsx}'] } : entry,
);

export default tseslint.config(
  { ignores: ['**/.next/**', '**/dist/**', '**/.turbo/**', '**/migrations/**', '**/node_modules/**'] },
  ...nextConfigScopedToWeb,
  webBoundary,
  webBoundaryOverride,
  packagesBoundary,
  noDangerousHtml,
  copyRules,
  {
    rules: {
      // Strict TS catches unused vars; the ESLint duplicate is just noise.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
