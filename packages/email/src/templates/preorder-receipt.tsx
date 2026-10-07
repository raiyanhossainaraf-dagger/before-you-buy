export type PreorderReceiptProps = {
  amountCents: number;
  offerTitle: string;
  refundTerms: string;
  termsUrl: string;
  senderAddress: string;
};

const body: React.CSSProperties = {
  margin: 0,
  backgroundColor: '#ffffff',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  color: '#1a1a1a',
};

const container: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '32px 24px',
};

const paragraph: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.5,
  margin: '0 0 16px',
};

const fine: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: '#666666',
  margin: '0 0 8px',
};

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/** M0.5: sent once, when `recordPaidPreorder` creates the row (never on a replayed webhook). */
export function PreorderReceipt({
  amountCents,
  offerTitle,
  refundTerms,
  termsUrl,
  senderAddress,
}: PreorderReceiptProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light dark" />
        <title>Your pre-order receipt</title>
      </head>
      <body style={body}>
        <div style={container}>
          <h1 style={{ fontSize: 20, lineHeight: 1.2, margin: '0 0 16px' }}>
            You&apos;re pre-ordered
          </h1>

          <p style={paragraph}>
            Thanks — we received {formatUsd(amountCents)} for: {offerTitle}
          </p>

          <p style={paragraph}>{refundTerms}</p>

          <p style={{ margin: '0 0 24px' }}>
            <a href={termsUrl} style={{ color: '#0f766e' }}>
              Read the full pre-order terms
            </a>
          </p>

          <p style={{ ...fine, marginBottom: 0 }}>
            Questions or want a refund before launch? Reply to this email. {senderAddress}
          </p>
        </div>
      </body>
    </html>
  );
}

export default PreorderReceipt;
