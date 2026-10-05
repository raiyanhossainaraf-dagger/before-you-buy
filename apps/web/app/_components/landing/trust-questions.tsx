/** PRD §3 — the gap no retailer fills, asked as three questions. */
const QUESTIONS = [
  {
    question: 'Are the reviews real?',
    answer:
      'A high star rating can still sit on a review-farmed listing. We look at the pattern behind the stars, not just the count.',
  },
  {
    question: 'Is the discount real?',
    answer:
      'A markdown only means something if the higher price was ever actually charged. We check 90 days of history.',
  },
  {
    question: 'Is this the same unit under eight names?',
    answer:
      'The same product gets relisted by different sellers at different prices. We match it back to one listing.',
  },
] as const;

export function TrustQuestions() {
  return (
    <section aria-labelledby="trust-questions-heading" className="mx-auto max-w-5xl px-4 py-12">
      <h2 id="trust-questions-heading" className="text-2xl font-semibold tracking-tight">
        Three questions every listing should answer
      </h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-3">
        {QUESTIONS.map((item) => (
          <li
            key={item.question}
            className="rounded-(--radius-card) border border-border bg-card p-6"
          >
            <p className="font-medium">{item.question}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
