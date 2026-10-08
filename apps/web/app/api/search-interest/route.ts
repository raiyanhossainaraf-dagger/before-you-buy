import { NextResponse } from 'next/server';
import { searchInterestRepo } from '@byb/db';
import { searchInterestRequestSchema } from '@byb/schemas';

/**
 * Prompt B item 4 — best-effort demand logging, fired once per /search page
 * view. No IP, no email (rule 1); failures never surface to the visitor.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = searchInterestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await searchInterestRepo.recordSearchInterest(parsed.data);
  } catch (err) {
    console.error('[search-interest] record failed', err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
