/** M0.6 replaces this with the real, legally-reviewed content for each page. */
export function LegalPlaceholder({ title }: { title: string }) {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-muted-foreground">
        This page is pending legal review and will be published before launch.
      </p>
    </main>
  );
}
