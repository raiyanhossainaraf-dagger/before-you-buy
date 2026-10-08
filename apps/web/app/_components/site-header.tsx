import { Menu } from 'lucide-react';

/**
 * DEC-038: global header on every route. Logo, Pricing, Sign in, "Get
 * notified" → /notify. The mobile menu is a native checkbox + label
 * disclosure (`peer-checked`) — no client JS needed to toggle it.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <a href="/" className="flex min-h-11 items-center text-lg font-semibold tracking-tight">
          Before You Buy
        </a>

        <input id="nav-toggle" type="checkbox" className="peer sr-only sm:hidden" />
        <label
          htmlFor="nav-toggle"
          className="flex min-h-11 min-w-11 items-center justify-center sm:hidden"
        >
          <Menu aria-hidden />
          <span className="sr-only">Menu</span>
        </label>

        <nav
          aria-label="Primary"
          className="absolute inset-x-0 top-16 hidden flex-col gap-1 border-t border-border bg-background px-4 py-2 peer-checked:flex sm:static sm:flex sm:flex-row sm:items-center sm:gap-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
        >
          <a
            href="/pricing"
            className="flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pricing
          </a>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex min-h-11 items-center text-sm font-medium text-muted-foreground disabled:opacity-60"
          >
            Sign in
          </button>
          <a
            href="/notify"
            className="my-1 flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground sm:my-0"
          >
            Get notified
          </a>
        </nav>
      </div>
    </header>
  );
}
