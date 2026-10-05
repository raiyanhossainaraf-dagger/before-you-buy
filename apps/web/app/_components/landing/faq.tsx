const FAQS = [
  {
    question: 'When does Before You Buy launch?',
    answer:
      "We're testing demand before building the full product. Join the waitlist and we'll email you once, when it's ready.",
  },
  {
    question: 'How is this different from a price comparison site?',
    answer:
      'We show the delivered price, not just the listed price, and whether the reviews and the discount hold up — and whether it is the same unit relisted elsewhere.',
  },
  {
    question: 'Which retailers do you compare?',
    answer: 'Amazon, eBay and Best Buy at launch.',
  },
  {
    question: 'Do you sell my data?',
    answer: 'No. We email you only about what you asked for, like a price alert.',
  },
] as const;

/** Native <details>/<summary> — accessible disclosure without a component dependency. */
export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-12">
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-border border-t border-border">
        {FAQS.map((item) => (
          <details key={item.question} className="py-4">
            <summary className="cursor-pointer font-medium marker:text-primary">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
