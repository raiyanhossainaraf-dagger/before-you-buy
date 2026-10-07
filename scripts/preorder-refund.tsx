#!/usr/bin/env tsx
/**
 * pnpm preorder:refund <id> — marks a pre-order refunded (sets refunded_at)
 * and emails the customer (LEGAL-10). Operates on the row's own id, not the
 * Stripe/mock session id. For the real `stripe` provider, refunds are
 * normally issued from the Stripe dashboard (TR-BILL-07); this script covers
 * the `mock` provider used locally in M0.
 */
import { config } from 'dotenv';
// tsx/esbuild run this script outside Next's automatic-JSX-runtime config, so
// the classic transform needs React in scope for the JSX below.
import React from 'react';

config({ path: '.env.local', quiet: true });

const [id] = process.argv.slice(2);
if (!id) {
  console.error('Usage: pnpm preorder:refund <preorder-id>');
  process.exit(1);
}

const { preorderRepo } = await import('@byb/db');
const { sendEmail } = await import('@byb/email');
const { PreorderRefunded } = await import('@byb/email/templates/preorder-refunded');
const { SENDER_IDENTITY } = await import('@byb/config');

const refunded = await preorderRepo.refundPreorderById(id, new Date());
if (!refunded) {
  console.error(`No pre-order found with id ${id}`);
  process.exit(1);
}

await sendEmail({
  to: refunded.email,
  subject: 'Your Before You Buy pre-order was refunded',
  react: <PreorderRefunded amountCents={refunded.amountCents} senderAddress={SENDER_IDENTITY} />,
});

console.log(`Refunded ${id} (${refunded.email}) and sent a confirmation email.`);

// The postgres pool otherwise keeps the process alive indefinitely.
process.exit(0);
