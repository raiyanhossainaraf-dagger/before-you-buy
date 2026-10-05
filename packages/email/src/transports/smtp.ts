import nodemailer from 'nodemailer';
import { serverEnv } from '@byb/config/server';
import type { EmailTransport } from '../index';

/** Local transport: Mailpit on SMTP 1025, viewable at http://localhost:8025. */
export const sendViaSmtp: EmailTransport = async (message) => {
  const env = serverEnv();

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // Mailpit accepts plain SMTP with no auth; this transport is local-only.
    secure: false,
    ignoreTLS: true,
  });

  await transporter.sendMail({
    from: message.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
};
