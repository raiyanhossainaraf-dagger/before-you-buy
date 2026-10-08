import { Menu } from 'lucide-react';
import { HeaderSearch } from './search/header-search';

const LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/sign-in', label: 'Sign in' },
] as const;

const LINK_CLASS =
  'flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground';
const CTA_CLASS =
  'flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground';

/**
 * DEC-038: global header on every route. Logo, search (compact, inner pages
 * only), Pricing, Sign in, "Get notified" → /notify. The mobile menu is a
 * native `<details>`/`<summary>` disclosure — no client JS to toggle it, and
 * keyboard/screen-reader operable for free (`<summary>` is a native focusable
 * toggle button). Desktop and mobile each render their own nav rather than
 * one shared element, so only one is ever in the accessibility tree.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <a href="/" className="flex min-h-11 shrink-0 items-center text-lg font-semibold tracking-tight">
          Before You Buy
        </a>

        <div className="hidden flex-1 justify-center sm:flex">
          <HeaderSearch />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className={LINK_CLASS}>
              {link.label}
            </a>
          ))}
          <a href="/notify" className={CTA_CLASS}>
            Get notified
          </a>
        </nav>

        <details className="relative sm:hidden">
          <summary
            className="flex min-h-11 min-w-11 list-none items-center justify-center [&::-webkit-details-marker]:hidden"
            aria-label="Menu"
          >
            <Menu aria-hidden />
          </summary>
          <nav
            aria-label="Primary"
            className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-border bg-background px-4 py-2 shadow-lg"
          >
            <div className="py-1">
              <HeaderSearch />
            </div>
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className={LINK_CLASS}>
                {link.label}
              </a>
            ))}
            <a href="/notify" className={`my-1 ${CTA_CLASS}`}>
              Get notified
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
