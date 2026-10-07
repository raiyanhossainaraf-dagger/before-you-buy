type Status = 'ok' | 'invalid' | 'expired';

const COPY: Record<Status, { heading: string; body: string }> = {
  ok: {
    heading: "You're on the list",
    body: "Your email is confirmed. We'll let you know when Before You Buy launches.",
  },
  expired: {
    heading: 'This link has expired',
    body: 'Confirmation links are only good for 24 hours. Sign up again from the homepage and we’ll send a new one.',
  },
  invalid: {
    heading: "This link didn't work",
    body: 'The confirmation link is invalid. Sign up again from the homepage and we’ll send a new one.',
  },
};

/** M0.4: landing page for the link clicked out of the double opt-in email. */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const copy = COPY[status === 'ok' || status === 'expired' ? status : 'invalid'];

  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{copy.body}</p>
      <a href="/" className="mt-8 inline-block text-sm font-medium underline">
        Back to the homepage
      </a>
    </main>
  );
}
