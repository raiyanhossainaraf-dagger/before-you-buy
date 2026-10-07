'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { CONSENT } from '@byb/config';
import {
  signupSourceSchema,
  waitlistSignupRequestSchema,
  type WaitlistSignupRequest,
} from '@byb/schemas/waitlist';
import { TurnstileWidget } from './turnstile-widget';

// `source` carries a zod `.default()`, so the pre-parse (input) shape leaves it
// optional while the post-parse (output, `WaitlistSignupRequest`) shape requires
// it — react-hook-form tracks the former, `onSubmit` receives the latter.
type WaitlistFormInput = z.input<typeof waitlistSignupRequestSchema>;

const UTM_PARAMS = ['source', 'medium', 'campaign', 'term', 'content'] as const;

/** Reads `?source=` and `?utm_*=` once on mount; defaults match the server schema. */
function readFormDefaults(): Pick<WaitlistSignupRequest, 'source' | 'utm' | 'referrer'> {
  if (typeof window === 'undefined') return { source: 'direct' };

  const params = new URLSearchParams(window.location.search);
  const sourceParam = signupSourceSchema.safeParse(params.get('source'));

  const utm = Object.fromEntries(
    UTM_PARAMS.map((key) => [key, params.get(`utm_${key}`) ?? undefined]).filter(([, v]) => v),
  );

  return {
    source: sourceParam.success ? sourceParam.data : 'direct',
    utm: Object.keys(utm).length > 0 ? utm : undefined,
    referrer: document.referrer || undefined,
  };
}

export function WaitlistForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<WaitlistFormInput, unknown, WaitlistSignupRequest>({
    resolver: zodResolver(waitlistSignupRequestSchema),
    defaultValues: { source: 'direct', turnstileToken: '' },
  });
  const turnstileToken = useWatch({ control, name: 'turnstileToken' });

  useEffect(() => {
    const defaults = readFormDefaults();
    setValue('source', defaults.source);
    if (defaults.utm) setValue('utm', defaults.utm);
    if (defaults.referrer) setValue('referrer', defaults.referrer);
  }, [setValue]);

  const handleVerify = useCallback((token: string) => setValue('turnstileToken', token), [setValue]);

  async function onSubmit(values: WaitlistSignupRequest) {
    setStatus('submitting');
    setServerMessage(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setServerMessage(data?.message ?? null);
      setStatus(res.ok ? 'done' : 'error');
      if (res.ok) reset({ source: values.source, turnstileToken: '' });
    } catch {
      setStatus('error');
      setServerMessage('Something went wrong. Please try again.');
    }
  }

  if (status === 'done') {
    return (
      <p role="status" className="text-sm">
        {serverMessage ?? "Check your inbox — we've sent a confirmation link."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="waitlist-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          className="min-h-11 rounded-control border border-border bg-background px-3 text-sm"
          aria-describedby={errors.email ? 'waitlist-email-error' : undefined}
          aria-invalid={errors.email ? true : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="waitlist-email-error" role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="waitlist-consent"
          type="checkbox"
          className="mt-0.5 h-5 w-5"
          aria-describedby={errors.consent ? 'waitlist-consent-error' : undefined}
          aria-invalid={errors.consent ? true : undefined}
          {...register('consent')}
        />
        <label htmlFor="waitlist-consent" className="text-sm text-muted-foreground">
          {CONSENT.text}{' '}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          .
        </label>
      </div>
      {errors.consent ? (
        <p id="waitlist-consent-error" role="alert" className="text-sm text-destructive">
          {errors.consent.message}
        </p>
      ) : null}

      <TurnstileWidget onVerify={handleVerify} />

      <button
        type="submit"
        disabled={status === 'submitting' || !turnstileToken}
        className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {status === 'submitting' ? 'Signing up…' : 'Get notified'}
      </button>

      {status === 'error' ? (
        <p role="alert" className="text-sm text-destructive">
          {serverMessage ?? 'Something went wrong. Please try again.'}
        </p>
      ) : null}
    </form>
  );
}
