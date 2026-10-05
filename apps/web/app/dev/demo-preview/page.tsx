import type { Metadata } from 'next';
import { DemoPicker } from '../../_components/landing/demo-picker';
import { demoFixtures } from '../../../content/demo/__fixtures__/comparisons';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Dev-only harness so e2e can prove the demo picker and ResultCard render
 * correctly against known-good data, independent of the real
 * content/demo/*.json files (which hold TODOs until hand-filled from actual
 * retailer checkouts — M0.3). Unlinked from navigation and noindexed.
 *
 * ponytail: no flags.isOn() gate yet (that's M1.3) — delete this route once
 * M11's real results page covers the same proof, or gate it then.
 */
export default function DemoPreviewPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Demo preview (dev only)</h1>
      <DemoPicker comparisons={demoFixtures} />
    </main>
  );
}
