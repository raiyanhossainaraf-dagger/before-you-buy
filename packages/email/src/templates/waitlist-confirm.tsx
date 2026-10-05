import { CONSENT } from '@byb/config';

/**
 * Plain JSX rather than @react-email/components: that package is deprecated
 * ("no longer supported") as of Oct 2026, and its wrappers compile to the same
 * inline-styled elements. @react-email/render still does the part that matters
 * — HTML plus a plain-text alternative from one source.
 */
export type WaitlistConfirmProps = {
  confirmUrl: string;
  /** CAN-SPAM / LEGAL-08: bulk mail must carry a sender identity. */
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

export function WaitlistConfirm({ confirmUrl, senderAddress }: WaitlistConfirmProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light dark" />
        <title>Confirm your email</title>
      </head>
      <body style={body}>
        <div style={container}>
          <h1 style={{ fontSize: 20, lineHeight: 1.2, margin: '0 0 16px' }}>
            Confirm your email
          </h1>

          <p style={paragraph}>
            One click and you are on the list. We will email you when Before You Buy
            launches.
          </p>

          <p style={{ margin: '0 0 24px' }}>
            <a
              href={confirmUrl}
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                borderRadius: 8,
                backgroundColor: '#0f766e',
                color: '#ffffff',
                fontSize: 16,
                textDecoration: 'none',
              }}
            >
              Confirm my email
            </a>
          </p>

          <p style={{ ...fine, marginBottom: 4 }}>
            If the button does not work, paste this into your browser:
          </p>
          <p style={{ ...fine, marginBottom: 24, wordBreak: 'break-all' }}>{confirmUrl}</p>

          <p style={fine}>{CONSENT.text}</p>
          <p style={{ ...fine, marginBottom: 0 }}>
            You received this because someone entered this address on our site. If that
            was not you, ignore this email and nothing further happens. {senderAddress}
          </p>
        </div>
      </body>
    </html>
  );
}

export default WaitlistConfirm;
