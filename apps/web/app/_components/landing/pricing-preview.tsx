import { PLANS } from '@byb/config';
import { formatCents } from '@byb/ui';

/** PRD §8 / UI §7.12 — values always come from packages/config, never hard-coded here. */
export function PricingPreview() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="mx-auto max-w-5xl px-4 py-12">
      <h2 id="pricing-heading" className="text-2xl font-semibold tracking-tight">
        Plans
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Every plan includes review authenticity and price history. Preview pricing — billing
        starts after launch.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <li
            key={plan.id}
            data-plan={plan.id}
            className="rounded-(--radius-card) border border-border bg-card p-6"
          >
            <p data-plan-name className="font-medium">
              {plan.name}
            </p>
            <p data-plan-price className="tnum mt-1 text-2xl font-semibold">
              {plan.priceCents === 0 ? 'Free' : `${formatCents(plan.priceCents)}/mo`}
            </p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>{plan.searches.toLocaleString()} searches/mo</li>
              <li>{plan.rateLimit}</li>
              <li>{plan.tracked} alerts</li>
              <li>{plan.api ? 'API access' : 'No API access'}</li>
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
