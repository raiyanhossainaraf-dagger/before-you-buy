/** M0.6: every legal draft carries this banner until a real legal review replaces the content. */
export function LegalDraftBanner() {
  return (
    <p className="mb-6 inline-block rounded-control bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
      Draft — pending legal review
    </p>
  );
}
