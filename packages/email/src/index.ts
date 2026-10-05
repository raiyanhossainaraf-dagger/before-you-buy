import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { serverEnv } from '@byb/config/server';
import { sendViaResend } from './transports/resend';
import { sendViaSmtp } from './transports/smtp';

export type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

export type EmailTransport = (input: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}) => Promise<void>;

/**
 * One send function, transport chosen by EMAIL_TRANSPORT:
 *   smtp   → Mailpit locally (M0)
 *   resend → Resend (written now, selected when hosting lands; M0.8)
 *
 * Both receive already-rendered HTML and a plain-text alternative, so swapping
 * the transport cannot change what a recipient sees.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const env = serverEnv();

  const [html, text] = await Promise.all([
    render(input.react),
    render(input.react, { plainText: true }),
  ]);

  const transport: EmailTransport =
    env.EMAIL_TRANSPORT === 'resend' ? sendViaResend : sendViaSmtp;

  await transport({
    to: input.to,
    from: env.EMAIL_FROM,
    subject: input.subject,
    html,
    text,
  });
}
