import { POSITIONING_CLAIM } from '@byb/config';
import { SearchCombobox } from '../search/search-combobox';

/** UI §7.1 — the short inline version of "how it works", not a standalone section. */
const STEPS = [
  'Search or paste a link',
  'We check three retailers',
  'See the top three, with reasons',
] as const;

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

      {/* Prompt B: preview-mode search — matches the 3 demo products, else an honest "not live yet" preview. */}
      <div data-slot="search-bar">
        <SearchCombobox />
      </div>

      <ol className="mx-auto mt-6 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-4">
        {STEPS.map((step, index) => (
          <li key={step}>
            <span className="tnum font-medium text-primary">{index + 1}.</span> {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
