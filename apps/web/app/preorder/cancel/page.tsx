import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pre-order canceled' };

export default function PreorderCancelPage() {
  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">No charge made</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Your pre-order was canceled. Nothing was charged.
      </p>
      <a href="/" className="mt-8 inline-block text-sm font-medium underline">
        Back to the homepage
      </a>
    </main>
  );
}
