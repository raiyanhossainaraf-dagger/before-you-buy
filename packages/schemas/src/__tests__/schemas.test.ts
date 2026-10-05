import { describe, expect, it } from 'vitest';
import { moneyRangeSchema } from '../common';
import { resultListingSchema } from '../listing';
import { waitlistSignupRequestSchema } from '../waitlist';
import { paymentEventSchema } from '../preorder';
import { analyticsEventSchema } from '../analytics';

describe('TR-CONV-02 money', () => {
  it('rejects a float amount', () => {
    expect(
      moneyRangeSchema.safeParse({ minCents: 1.5, maxCents: 2, currency: 'USD' }).success,
    ).toBe(false);
  });

  it('rejects an inverted range', () => {
    expect(
      moneyRangeSchema.safeParse({ minCents: 500, maxCents: 100, currency: 'USD' }).success,
    ).toBe(false);
  });

  it('accepts a complete range where min equals max', () => {
    expect(
      moneyRangeSchema.safeParse({ minCents: 500, maxCents: 500, currency: 'USD' }).success,
    ).toBe(true);
  });
});

describe('TR-CONV-05 strict objects at trust boundaries', () => {
  it('rejects unknown keys on a waitlist signup', () => {
    const result = waitlistSignupRequestSchema.safeParse({
      email: 'buyer@example.com',
      consent: true,
      turnstileToken: 'x',
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });

  it('requires consent before an email is accepted (LEGAL-08)', () => {
    const result = waitlistSignupRequestSchema.safeParse({
      email: 'buyer@example.com',
      consent: false,
      turnstileToken: 'x',
    });
    expect(result.success).toBe(false);
  });

  it('defaults source to direct', () => {
    const result = waitlistSignupRequestSchema.parse({
      email: 'buyer@example.com',
      consent: true,
      turnstileToken: 'x',
    });
    expect(result.source).toBe('direct');
  });
});

describe('rule 11 outbound links', () => {
  it('rejects a raw retailer URL as outboundUrl', () => {
    const result = resultListingSchema
      .pick({ outboundUrl: true })
      .safeParse({ outboundUrl: 'https://www.amazon.com/dp/B0ABCDEFGH' });
    expect(result.success).toBe(false);
  });

  it('accepts a /go/ token path', () => {
    const result = resultListingSchema
      .pick({ outboundUrl: true })
      .safeParse({ outboundUrl: '/go/abc123' });
    expect(result.success).toBe(true);
  });
});

describe('payment events', () => {
  it('rejects a negative amount', () => {
    const result = paymentEventSchema.safeParse({
      type: 'checkout_completed',
      sessionId: 's',
      paymentIntentId: null,
      email: 'buyer@example.com',
      amountCents: -1,
      currency: 'USD',
      offerCode: 'starter_3mo_launch',
    });
    expect(result.success).toBe(false);
  });
});

describe('TR-ANL-02 analytics events', () => {
  it('accepts a Gate 0 event', () => {
    expect(
      analyticsEventSchema.safeParse({
        name: 'preorder_paid',
        props: { amountCents: 4900, offerCode: 'starter_3mo_launch' },
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown event name', () => {
    expect(
      analyticsEventSchema.safeParse({ name: 'something_made_up', props: {} }).success,
    ).toBe(false);
  });
});
