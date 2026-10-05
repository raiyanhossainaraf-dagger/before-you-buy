import { POSITIONING_CLAIM } from '@byb/config';

/** PRD §3 positioning claim, used verbatim as the headline (UI §7.14). */
export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:pt-24">
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
        {POSITIONING_CLAIM}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We compare Amazon, eBay and Best Buy on delivered price, review signals and 90-day price
        history.
      </p>
    </section>
  );
}
