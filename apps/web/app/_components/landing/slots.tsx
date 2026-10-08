import { DemoPicker } from './demo-picker';
import { loadDemoComparisons } from '@/lib/demo-comparisons';

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
