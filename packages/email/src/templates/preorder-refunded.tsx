// Rendered both by Next (automatic JSX runtime) and by the plain tsx script
// `scripts/preorder-refund.tsx` (classic transform, needs React in scope).
import React from 'react';

export type PreorderRefundedProps = {
  amountCents: number;
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
  margin: 0,
};

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/** `pnpm preorder:refund` (M0.5, LEGAL-10). */
export function PreorderRefunded({ amountCents, senderAddress }: PreorderRefundedProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light dark" />
        <title>Your pre-order was refunded</title>
      </head>
      <body style={body}>
        <div style={container}>
          <h1 style={{ fontSize: 20, lineHeight: 1.2, margin: '0 0 16px' }}>
            Your pre-order was refunded
          </h1>

          <p style={paragraph}>
            We refunded {formatUsd(amountCents)} to your original payment method. It should
            appear within a few business days.
          </p>

          <p style={fine}>Questions? Reply to this email. {senderAddress}</p>
        </div>
      </body>
    </html>
  );
}

export default PreorderRefunded;
