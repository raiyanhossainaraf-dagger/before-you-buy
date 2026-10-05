import { POSITIONING_CLAIM } from '@byb/config';

/** Placeholder until M0.2 builds the Gate 0 landing page (UI §7.14). */
export default function HomePage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Before You Buy</h1>
      <p className="mt-4 text-lg text-muted-foreground">{POSITIONING_CLAIM}</p>
      <p className="mt-8 text-sm text-muted-foreground">
        The Gate 0 landing page arrives in M0.2.
      </p>
    </main>
  );
}
