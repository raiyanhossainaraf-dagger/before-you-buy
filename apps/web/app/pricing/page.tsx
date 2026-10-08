import type { Metadata } from 'next';
import { PLANS } from '@byb/config';
import { formatCents } from '@byb/ui';
import { PreorderCard } from '../_components/landing/preorder-card';

export const metadata: Metadata = { title: 'Pricing' };

const CREDITS_FAQ = [
  {
    question: 'What is a credit?',
    answer:
      'Searches are metered in credits, not calls — a cache hit costs far less than a live three-retailer check, so the same plan covers more searches when results are already fresh.',
  },
  {
    question: 'What happens on a cache hit?',
    answer: 'Cached results use a small fraction of a credit. Most repeat searches are cache hits.',
  },
  {
    question: 'What happens if I go over my quota?',
    answer:
      "You're billed overage rather than cut off — a quota limit never breaks a search mid-month.",
  },
] as const;

/** UI §7.12 / DEC-038 — plan cards moved here from the home page. */
export default function PricingPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Plans</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every plan includes review authenticity and price history. Preview pricing — billing
        starts after launch.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const highlighted = plan.id === 'starter';
          return (
            <li
              key={plan.id}
              data-plan={plan.id}
              className={`flex flex-col rounded-card border bg-card p-6 ${
                highlighted ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              {highlighted ? (
                <span className="mb-2 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Most popular
                </span>
              ) : null}
              <p data-plan-name className="font-medium">
                {plan.name}
              </p>
              <p data-plan-price className="tnum mt-1 text-2xl font-semibold">
                {plan.priceCents === 0 ? 'Free' : `${formatCents(plan.priceCents)}/mo`}
              </p>
              <ul className="mt-4 flex-1 space-y-1 text-sm text-muted-foreground">
                <li>{plan.searches.toLocaleString()} searches/mo</li>
                <li>{plan.rateLimit}</li>
                <li>{plan.tracked} alerts</li>
                <li>{plan.api ? 'API access' : 'No API access'}</li>
              </ul>
              <a
                href="/notify"
                className="mt-6 flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Get started
              </a>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
        <strong className="text-foreground">Enterprise</strong> — quoted custom from $2,000/mo,
        for teams running continuous margin checks across many products. Email{' '}
        <a href="mailto:sales@beforeyoubuy.local" className="underline">
          sales@beforeyoubuy.local
        </a>{' '}
        to talk.
      </p>

      <section aria-labelledby="preorder-heading" className="mt-16 max-w-sm">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Founding offer
        </span>
        <h2 id="preorder-heading" className="mt-2 text-2xl font-semibold tracking-tight">
          Reserve launch pricing
        </h2>
        <div className="mt-6">
          <PreorderCard />
        </div>
      </section>

      <section aria-labelledby="credits-faq-heading" className="mt-16 max-w-3xl">
        <h2 id="credits-faq-heading" className="text-2xl font-semibold tracking-tight">
          Credits FAQ
        </h2>
        <div className="mt-6 divide-y divide-border border-t border-border">
          {CREDITS_FAQ.map((item) => (
            <details key={item.question} className="py-4">
              <summary className="cursor-pointer font-medium marker:text-primary">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
