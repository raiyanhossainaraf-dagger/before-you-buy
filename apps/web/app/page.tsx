import { Hero } from './_components/landing/hero';
import { TrustQuestions } from './_components/landing/trust-questions';
import { DemoSlot } from './_components/landing/slots';

/** DEC-038 — home is hero, trust questions and the live demo; pricing/waitlist/pre-order moved out. */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <TrustQuestions />
      <DemoSlot />

      <section aria-labelledby="get-started-heading" className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 id="get-started-heading" className="text-2xl font-semibold tracking-tight">
          Not live yet — here&apos;s how to get in early
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          See what plans will cost, or get notified the moment we launch.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/pricing"
            className="flex min-h-11 w-full items-center justify-center rounded-control border border-border px-6 text-sm font-medium sm:w-auto"
          >
            See pricing
          </a>
          <a
            href="/notify"
            className="flex min-h-11 w-full items-center justify-center rounded-control bg-primary px-6 text-sm font-medium text-primary-foreground sm:w-auto"
          >
            Get notified
          </a>
        </div>
      </section>
    </main>
  );
}
