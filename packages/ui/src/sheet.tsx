import { Dialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';
import { cn } from './lib/cn';

/**
 * UI §10 BreakdownSheet/TrustSheet: one Dialog covers both the phone-drawer
 * and desktop-dialog cases for M0.3 — a responsive drawer-vs-dialog split
 * adds no value until a real breakdown sheet needs it (M11).
 */
export function Sheet({
  trigger,
  title,
  children,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className={cn(
          'inline-flex min-h-11 items-center gap-1 text-sm underline-offset-2 hover:underline',
        )}
      >
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-foreground/20" />
        <Dialog.Popup className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-card border border-border bg-card p-6 shadow-lg sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-card">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <div className="mt-3 space-y-3 text-sm">{children}</div>
          <Dialog.Close className="mt-4 min-h-11 min-w-11 rounded-control border border-border px-4 text-sm">
            Close
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
