#!/usr/bin/env tsx
/**
 * pnpm demo:validate — checks every apps/web/content/demo/*.json against
 * DemoComparison, fails on any leftover "TODO" string, and recomputes landed
 * cost per listing so hand-entered arithmetic errors are caught before they
 * reach the landing page (rule 3/4).
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { demoComparisonSchema } from '@byb/schemas/demo';
import { checkLandedCostArithmetic, findTodoPaths } from '@byb/core/demo-validate';

const demoDir = join(import.meta.dirname, '..', 'apps', 'web', 'content', 'demo');
const files = (await readdir(demoDir)).filter((name) => name.endsWith('.json'));

if (files.length === 0) {
  console.error(`No .json files found in ${demoDir}`);
  process.exit(1);
}

let failed = false;

for (const file of files) {
  const path = join(demoDir, file);
  const raw = JSON.parse(await readFile(path, 'utf8'));
  const errors: string[] = [];

  const todoPaths = findTodoPaths(raw);
  errors.push(...todoPaths.map((p) => `leftover TODO at ${p}`));

  const parsed = demoComparisonSchema.safeParse(raw);
  if (!parsed.success) {
    errors.push(`schema: ${parsed.error.message}`);
  } else {
    for (const listing of parsed.data.listings) {
      const mismatch = checkLandedCostArithmetic(listing);
      if (mismatch) errors.push(`listing ${listing.listingId}: ${mismatch}`);
    }
  }

  if (errors.length > 0) {
    failed = true;
    console.error(`\n${file}:`);
    for (const error of errors) console.error(`  - ${error}`);
  } else {
    console.log(`${file}: ok`);
  }
}

if (failed) process.exit(1);
