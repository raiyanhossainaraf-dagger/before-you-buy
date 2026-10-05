const STEPS = [
  {
    title: 'Search or paste a link',
    body: 'Type a product name, or paste an Amazon, eBay or Best Buy link.',
  },
  {
    title: 'We check three retailers',
    body: 'We compare delivered price, review signals and 90-day price history across Amazon, eBay and Best Buy.',
  },
  {
    title: 'See the top three, with reasons',
    body: 'Each option shows why it ranked where it did. Set a price alert if you want to wait.',
  },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="mx-auto max-w-5xl px-4 py-12">
      <h2 id="how-it-works-heading" className="text-2xl font-semibold tracking-tight">
        How it works
      </h2>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-(--radius-card) border border-border bg-card p-6">
            <p className="tnum text-sm font-medium text-primary">Step {index + 1}</p>
            <p className="mt-1 font-medium">{step.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
