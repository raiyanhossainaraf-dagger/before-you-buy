import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocal } from '@byb/config/server';
import { waitlistRepo, preorderRepo } from '@byb/db';
import { gate0Status, type Gate0Status } from '@byb/core';
import { gate0ManualRepliesSchema } from '@byb/schemas';
import gate0Manual from '../../../content/gate0-manual.json';

export const metadata: Metadata = { title: 'Gate 0 dashboard', robots: { index: false, follow: false } };
// Live counts and the APP_ENV gate must be evaluated per request, not baked into a static build.
export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<Gate0Status, string> = {
  proceed: 'Proceed',
  reconsider: 'Reconsider',
  not_enough_data: 'Not enough data yet',
};

const STATUS_CLASS: Record<Gate0Status, string> = {
  proceed: 'text-trust-good',
  reconsider: 'text-trust-poor',
  not_enough_data: 'text-trust-unknown',
};

function StatusLine({ status }: { status: Gate0Status }) {
  return <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>;
}

/**
 * PRD §12.1 Gate 0 decision dashboard. Local-only (404 elsewhere) — this is
 * for us to decide whether to keep building, not a public page.
 */
export default async function Gate0DashboardPage() {
  if (!isLocal()) notFound();

  const [signups, bySource, byDay, preorders] = await Promise.all([
    waitlistRepo.countSignups(),
    waitlistRepo.countSignupsBySource(),
    waitlistRepo.signupsByDay(),
    preorderRepo.countPreorders(),
  ]);

  const manualReplies = gate0ManualRepliesSchema.parse(gate0Manual);

  const signupsStatus = gate0Status(signups.total, { proceedAt: 100, reconsiderBelow: 30 });
  const repliesStatus = gate0Status(manualReplies.length, { proceedAt: 10, reconsiderBelow: 3 });
  const preordersStatus = gate0Status(preorders.paid, { proceedAt: 10, reconsiderBelow: 1 });

  const conversion = signups.total > 0 ? preorders.paid / signups.total : 0;

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Gate 0 dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Local only. PRD §12.1 thresholds decide whether to keep building.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Email signups</h2>
        <p className="mt-1 text-sm">
          {signups.total} total ({signups.confirmed} confirmed) · <StatusLine status={signupsStatus} /> (proceed
          at 100+, reconsider under 30)
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1">Source</th>
              <th className="py-1">Total</th>
              <th className="py-1">Confirmed</th>
            </tr>
          </thead>
          <tbody>
            {bySource.map((row) => (
              <tr key={row.source} className="border-t border-border">
                <td className="py-1">{row.source}</td>
                <td className="py-1">{row.total}</td>
                <td className="py-1">{row.confirmed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Daily signups</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1">Day</th>
              <th className="py-1">Signups</th>
            </tr>
          </thead>
          <tbody>
            {byDay.map((row) => (
              <tr key={row.day} className="border-t border-border">
                <td className="py-1">{row.day}</td>
                <td className="py-1">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">&ldquo;When does it ship&rdquo; replies</h2>
        <p className="mt-1 text-sm">
          {manualReplies.length} logged by hand · <StatusLine status={repliesStatus} /> (proceed at 10+,
          reconsider under 3)
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {manualReplies.map((reply, i) => (
            <li key={i}>
              {reply.date} · {reply.channel} — {reply.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Pre-orders</h2>
        <p className="mt-1 text-sm">
          {preorders.paid} paid, {preorders.refunded} refunded · <StatusLine status={preordersStatus} /> (proceed
          at 10+, reconsider at 0)
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Signup → pre-order conversion: {(conversion * 100).toFixed(1)}%
        </p>
      </section>
    </main>
  );
}
