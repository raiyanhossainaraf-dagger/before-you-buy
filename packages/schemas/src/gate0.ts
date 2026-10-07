import { z } from 'zod';

/**
 * PRD §12.1: "when does it ship" is counted by hand from DMs/comments, not
 * instrumented — apps/web/content/gate0-manual.json is a hand-maintained log.
 */
export const gate0ManualReplySchema = z.strictObject({
  date: z.iso.date(),
  channel: z.enum(['show_hn', 'reddit', 'dm', 'email', 'other']),
  note: z.string().max(500),
});
export type Gate0ManualReply = z.infer<typeof gate0ManualReplySchema>;

export const gate0ManualRepliesSchema = z.array(gate0ManualReplySchema);
