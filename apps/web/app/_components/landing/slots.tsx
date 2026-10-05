/**
 * Placeholder sections for later M0 tasks: the M0.3 demo, M0.4 email form and
 * M0.5 pre-order card. Each is a marked slot only — no functionality yet.
 * `data-slot` lets tests assert the slot exists without coupling to copy that
 * will change when the real component lands.
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
  return (
    <SlotSection
      slot="demo-m0-3"
      headingId="demo-heading"
      heading="See it on three real products"
      body="Live demo comparisons are coming soon."
    />
  );
}

export function EmailCaptureSlot() {
  return (
    <SlotSection
      slot="email-capture-m0-4"
      headingId="waitlist-heading"
      heading="Get notified at launch"
      body="The email signup form arrives soon."
    />
  );
}

export function PreorderSlot() {
  return (
    <SlotSection
      slot="preorder-m0-5"
      headingId="preorder-heading"
      heading="Reserve launch pricing"
      body="Pre-orders open soon."
    />
  );
}
