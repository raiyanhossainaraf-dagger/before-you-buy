#!/usr/bin/env node
/**
 * pnpm env:local — copy .env.example to .env.local with local values filled in.
 *
 * Placeholder secrets are replaced with real random values so no two clones
 * share a signing key, and so LINK_SIGNING_SECRET's ≥ 32 char rule passes.
 */
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '.env.example');
const target = join(root, '.env.local');
const force = process.argv.includes('--force');

if (existsSync(target) && !force) {
  console.error('.env.local already exists. Re-create it with: pnpm env:local --force');
  process.exit(1);
}

const PLACEHOLDER = 'replace-with-32-plus-random-characters';
const secret = () => randomBytes(32).toString('base64url');

const filled = (await readFile(source, 'utf8'))
  .split('\n')
  .map((line) => (line.includes(PLACEHOLDER) ? line.replace(PLACEHOLDER, secret()) : line))
  .join('\n');

await writeFile(target, filled, 'utf8');

console.log('Wrote .env.local with local values and freshly generated secrets.');
console.log('Next: pnpm services:up && pnpm db:migrate && pnpm dev');
