#!/usr/bin/env tsx
/**
 * pnpm demo:derive — fills the computed fields (tax, landed cost, ranking
 * order/reasons, cheaper-alternative saving/reasons) in
 * apps/web/content/demo/*.json from the raw facts already hand-entered
 * there. Fields whose inputs are still "TODO" are left untouched. Run
 * pnpm demo:validate afterward.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  deriveCheaperAlternative,
  deriveListing,
  deriveRankingTop,
} from '@byb/core/demo-derive';

const demoDir = join(import.meta.dirname, '..', 'apps', 'web', 'content', 'demo');
const files = (await readdir(demoDir)).filter((name) => name.endsWith('.json'));

for (const file of files) {
  const path = join(demoDir, file);
  const data = JSON.parse(await readFile(path, 'utf8'));

  data.listings = data.listings.map(deriveListing);
  data.ranking.top = deriveRankingTop(data.listings);

  const altId = data.ranking.cheaperAlternative?.listingId;
  if (altId) {
    const alt = data.listings.find((l: { listingId: string }) => l.listingId === altId);
    const top1 = data.listings.find(
      (l: { listingId: string }) => l.listingId === data.ranking.top[0]?.listingId,
    );
    const derived = alt && top1 ? deriveCheaperAlternative(top1, alt) : null;
    if (derived) {
      Object.assign(data.ranking.cheaperAlternative, derived);
    } else {
      delete data.ranking.cheaperAlternative;
    }
  }

  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`${file}: derived`);
}
