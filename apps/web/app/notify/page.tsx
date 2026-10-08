import type { Metadata } from 'next';
import { WaitlistForm } from '../_components/landing/waitlist-form';

export const metadata: Metadata = { title: 'Get notified' };

const WHAT_YOU_GET = [
  'One email the moment Before You Buy launches — no spam before then.',
  'First access to founding pricing before it opens to everyone else.',
  'Occasional progress updates, never more than a few a month.',
] as const;

/** DEC-038/039 — waitlist moved here from the home page; `?q=` personalizes the heading. */
export default async function NotifyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {query ? `We'll tell you when you can check '${query}'` : 'Get notified at launch'}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {query
          ? "That product isn't ready to check yet. Leave your email and we'll let you know the moment it is."
          : "Leave your email and we'll let you know the moment Before You Buy opens up."}
      </p>

      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        {WHAT_YOU_GET.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-primary">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <WaitlistForm />
      </div>
    </main>
  );
}
