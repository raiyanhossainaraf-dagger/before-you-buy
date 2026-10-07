import { NextResponse } from 'next/server';
import { waitlistRepo } from '@byb/db';
import { serverEnv } from '@byb/config/server';
import { verifyConfirmToken } from '@byb/core';
import { track } from '@/lib/analytics';

/**
 * Clicked from the confirmation email. Redirects to the friendly `/confirm`
 * page rather than rendering here, since this route keeps the DEC-031 db
 * import and `/confirm` does not need one.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  const env = serverEnv();
  const target = new URL('/confirm', env.WEB_ORIGIN);

  if (!token) {
    target.searchParams.set('status', 'invalid');
    return NextResponse.redirect(target);
  }

  const result = verifyConfirmToken(token, env.LINK_SIGNING_SECRET, new Date());
  if (!result.ok) {
    target.searchParams.set('status', result.reason);
    return NextResponse.redirect(target);
  }

  const changed = await waitlistRepo.confirmSignup(result.id, new Date());
  if (changed) track({ name: 'waitlist_confirmed', props: {} });

  target.searchParams.set('status', 'ok');
  return NextResponse.redirect(target);
}
