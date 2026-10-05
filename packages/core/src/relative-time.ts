const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

/** UI §9.2: "Checked 3 minutes ago", never a raw ISO timestamp. */
export function formatCheckedAgo(checkedAt: string, now: Date): string {
  const seconds = Math.round((now.getTime() - new Date(checkedAt).getTime()) / 1000);
  if (seconds < 60) return 'Checked just now';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Checked ${rtf.format(-minutes, 'minute')}`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Checked ${rtf.format(-hours, 'hour')}`;

  const days = Math.round(hours / 24);
  return `Checked ${rtf.format(-days, 'day')}`;
}
