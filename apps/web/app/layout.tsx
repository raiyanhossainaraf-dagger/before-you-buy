import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { POSITIONING_CLAIM } from '@byb/config';
import './globals.css';

/**
 * UI §5.2: one self-hosted variable sans. The bytes come from the
 * @fontsource-variable/inter package so the build does not need network access
 * and the exact file is pinned in the lockfile.
 */
const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'Before You Buy — is this listing trustworthy?',
    template: '%s · Before You Buy',
  },
  description: POSITIONING_CLAIM,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-(--radius-control) focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
