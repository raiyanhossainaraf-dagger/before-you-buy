#!/usr/bin/env tsx
/**
 * pnpm demo:capture <input.json> — validate a hand-recorded demo comparison
 * against DemoComparison and write it to apps/web/content/demo/.
 *
 * M0.3: there are no provider accounts locally (no eBay/Best Buy keys, no
 * BrightData) and rule 2 forbids fetching a user-supplied URL, so a real
 * capture is recorded by hand from the retailer sites and fed through this
 * validator rather than scraped. Until that happens, the three files under
 * content/demo/ are marked `_sample: true` — invented but clearly labelled —
 * and docs/reports/gate-0.md lists replacing them as a prerequisite to
 * running the actual Gate 0 test.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { demoComparisonSchema } from '@byb/schemas/demo';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: pnpm demo:capture <path-to-input.json>');
  process.exit(1);
}

const raw = JSON.parse(await readFile(inputPath, 'utf8'));
const parsed = demoComparisonSchema.safeParse(raw);

if (!parsed.success) {
  console.error(`${inputPath} does not match DemoComparison:`);
  console.error(parsed.error.message);
  process.exit(1);
}

const outDir = join(import.meta.dirname, '..', 'apps', 'web', 'content', 'demo');
const outPath = join(outDir, `${parsed.data.slug}.json`);
await writeFile(outPath, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');

console.log(`Wrote ${outPath} (sample: ${parsed.data._sample})`);
console.log(`Input: ${basename(inputPath)}`);
