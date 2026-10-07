'use client';

import { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PREORDER_OFFER } from '@byb/config';
import { preorderCheckoutRequestSchema, type PreorderCheckoutRequest } from '@byb/schemas/preorder';
import { TurnstileWidget } from './turnstile-widget';

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/** M0.5: the real pre-order card, replacing the M0.2 placeholder slot. */
export function PreorderCard() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PreorderCheckoutRequest>({
    resolver: zodResolver(preorderCheckoutRequestSchema),
    defaultValues: { turnstileToken: '' },
  });
  const turnstileToken = useWatch({ control, name: 'turnstileToken' });

  const handleVerify = useCallback((token: string) => setValue('turnstileToken', token), [setValue]);

  async function onSubmit(values: PreorderCheckoutRequest) {
    setStatus('submitting');
    setServerMessage(null);
    try {
      const res = await fetch('/api/preorder/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as
        | { checkoutUrl?: string; message?: string }
        | null;

      if (res.ok && data?.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setServerMessage(data?.message ?? 'Something went wrong. Please try again.');
      setStatus('error');
    } catch {
      setServerMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="max-w-sm rounded-card border border-border bg-card p-6">
      <p className="text-3xl font-semibold tabular-nums">{formatUsd(PREORDER_OFFER.amountCents)}</p>
      <p className="mt-1 text-sm font-medium">{PREORDER_OFFER.title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{PREORDER_OFFER.summary}</p>
      <p className="mt-2 text-sm font-medium">{PREORDER_OFFER.refundTerms}</p>
      <a href="/pre-order-terms" className="mt-1 inline-block text-sm underline">
        Read the pre-order terms
      </a>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="preorder-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="preorder-email"
            type="email"
            autoComplete="email"
            className="min-h-11 rounded-control border border-border bg-background px-3 text-sm"
            aria-describedby={errors.email ? 'preorder-email-error' : undefined}
            aria-invalid={errors.email ? true : undefined}
            {...register('email')}
          />
          {errors.email ? (
            <p id="preorder-email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <TurnstileWidget onVerify={handleVerify} />

        <button
          type="submit"
          disabled={status === 'submitting' || !turnstileToken}
          className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {status === 'submitting' ? 'Redirecting…' : 'Reserve my spot'}
        </button>

        {status === 'error' ? (
          <p role="alert" className="text-sm text-destructive">
            {serverMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
