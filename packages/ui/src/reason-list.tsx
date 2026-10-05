/** UI §7.3: "Why #1: …" — 1–3 short factual reasons, deterministic templates only (TR-RANK-04). */
export function ReasonList({
  reasons,
  label,
}: {
  reasons: Array<{ code: string; text: string }>;
  label?: string | undefined;
}) {
  if (reasons.length === 0) return null;
  return (
    <p className="text-sm text-foreground">
      {label ? <span className="font-medium">{label}: </span> : null}
      {reasons.map((reason, i) => (
        <span key={reason.code}>
          {i > 0 ? '; ' : ''}
          {reason.text}
        </span>
      ))}
    </p>
  );
}
