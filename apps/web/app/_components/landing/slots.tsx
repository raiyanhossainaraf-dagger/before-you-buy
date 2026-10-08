import { demoComparisonSchema, type DemoComparison } from '@byb/schemas';
import { DemoPicker } from './demo-picker';
import sonyWh1000xm5 from '../../../content/demo/sony-wh-1000xm5.json';
import robotVacuum from '../../../content/demo/robot-vacuum.json';
import ipadBase from '../../../content/demo/ipad-base.json';

/**
 * The M0.3 demo falls back to this pending message when none of the hand-filled
 * JSON files validate yet. `data-slot` lets tests assert the slot exists without
 * coupling to copy that will change once it does.
 */
function SlotSection({
  slot,
  headingId,
  heading,
  body,
}: {
  slot: string;
  headingId: string;
  heading: string;
  body: string;
}) {
  return (
    <section data-slot={slot} aria-labelledby={headingId} className="mx-auto max-w-5xl px-4 py-12">
      <h2 id={headingId} className="text-2xl font-semibold tracking-tight">
        {heading}
      </h2>
      <p className="mt-4 text-sm text-muted-foreground">{body}</p>
    </section>
  );
}

/**
 * M0.3: only comparisons whose captured data already validates (no leftover
 * TODOs) are shown — a hand-filled JSON file with a typo falls back to the
 * pending message instead of breaking the landing page.
 */
function loadDemoComparisons(): DemoComparison[] {
  return [sonyWh1000xm5, robotVacuum, ipadBase]
    .map((raw) => demoComparisonSchema.safeParse(raw))
    .filter((result) => result.success)
    .map((result) => result.data);
}

export function DemoSlot() {
  const comparisons = loadDemoComparisons();

  if (comparisons.length === 0) {
    return (
      <SlotSection
        slot="demo-m0-3"
        headingId="demo-heading"
        heading="See it on three real products"
        body="Live demo comparisons are coming soon."
      />
    );
  }

  return (
    <section aria-labelledby="demo-heading" className="mx-auto max-w-5xl px-4 py-12">
      <h2 id="demo-heading" className="text-2xl font-semibold tracking-tight">
        See it on three real products
      </h2>
      <div className="mt-6">
        <DemoPicker comparisons={comparisons} />
      </div>
    </section>
  );
}
