import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * TR-AUTH-02's final layout (magic link + passkey), shown disabled ahead of
 * Better Auth landing (M1+) — never a fake login that pretends to work.
 */
export default function SignInPage() {
  return (
    <main id="main" className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Accounts open at launch.</p>

      <form className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sign-in-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="sign-in-email"
            type="email"
            disabled
            placeholder="you@example.com"
            className="min-h-11 rounded-control border border-border bg-muted px-3 text-sm text-muted-foreground"
          />
        </div>

        <button
          type="button"
          disabled
          className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          Continue with email
        </button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          disabled
          className="min-h-11 rounded-control border border-border px-4 text-sm font-medium text-muted-foreground disabled:opacity-60"
        >
          Continue with passkey
        </button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Accounts open at launch — get notified when they do.
      </p>
      <Link
        href="/notify"
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-control bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Get notified
      </Link>
    </main>
  );
}
