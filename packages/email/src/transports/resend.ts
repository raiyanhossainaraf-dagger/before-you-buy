import { Resend } from 'resend';
import { serverEnv } from '@byb/config/server';
import type { EmailTransport } from '../index';

/**
 * Implemented but unused in M0: selected by EMAIL_TRANSPORT=resend once a
 * sending domain with SPF/DKIM/DMARC exists (M0.8, deferred until hosting).
 */
export const sendViaResend: EmailTransport = async (message) => {
  const env = serverEnv();
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is required when EMAIL_TRANSPORT=resend');

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: message.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  // SEC-51: the address is not included in the error we raise.
  if (error) throw new Error(`Resend rejected the message: ${error.name}`);
};
