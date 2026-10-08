import { describe, expect, it } from 'vitest';
import { normalizeQuery } from '@byb/core';
import { loadDemoComparisons, matchDemoProduct } from './demo-comparisons';

const comparisons = loadDemoComparisons();

describe('loadDemoComparisons', () => {
  it('loads all three hand-captured demo products', () => {
    expect(comparisons.map((c) => c.slug).sort()).toEqual([
      'ipad-base',
      'robot-vacuum',
      'sony-wh-1000xm5',
    ]);
  });
});

describe('matchDemoProduct (Prompt B item 3: /search demo matching)', () => {
  it.each([
    ['sony headphones', 'sony-wh-1000xm5'],
    ['wh-1000xm5', 'sony-wh-1000xm5'],
    ['noise cancelling sony', 'sony-wh-1000xm5'],
    ['ipad', 'ipad-base'],
    ['apple tablet', 'ipad-base'],
    ['robot vacuum', 'robot-vacuum'],
    ['shark vacuum', 'robot-vacuum'],
  ])('matches "%s" to %s', (query, expectedSlug) => {
    const match = matchDemoProduct(normalizeQuery(query), comparisons);
    expect(match?.slug).toBe(expectedSlug);
  });

  it('returns undefined for a product we do not demo', () => {
    const match = matchDemoProduct(normalizeQuery('playstation 5 console'), comparisons);
    expect(match).toBeUndefined();
  });

  it('returns undefined for an empty normalized query', () => {
    expect(matchDemoProduct('', comparisons)).toBeUndefined();
  });
});
