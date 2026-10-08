import { describe, expect, it } from 'vitest';
import { normalizeQuery, parseRetailerUrl } from '../url-parse';

describe('normalizeQuery (TR-INT-06)', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalizeQuery('  Sony   Headphones  ')).toBe('sony headphones');
  });

  it('preserves model-number tokens verbatim', () => {
    expect(normalizeQuery('Sony WH-1000XM5')).toBe('sony wh-1000xm5');
  });

  it('strips disallowed punctuation but keeps -, /, ., +, "', () => {
    expect(normalizeQuery('iPad 11" (Wi-Fi + Cellular)!!')).toBe('ipad 11" wi-fi + cellular');
  });

  it('applies NFKC normalization', () => {
    // fullwidth "５" (U+FF15) NFKC-normalizes to ASCII "5"
    expect(normalizeQuery('WH-1000XM５')).toBe('wh-1000xm5');
  });
});

describe('parseRetailerUrl — not URL-shaped input (TR-INT)', () => {
  it('returns null for a plain text query', () => {
    expect(parseRetailerUrl('sony wh-1000xm5 headphones')).toBeNull();
  });

  it('returns null for text that merely contains a dot', () => {
    expect(parseRetailerUrl('ipad 10.9 inch')).toBeNull();
  });
});

describe('parseRetailerUrl — host allowlist (TR-INT-02)', () => {
  it.each([
    'https://www.amazon.com/dp/B0CM5JV268',
    'https://amazon.com/dp/B0CM5JV268',
    'https://m.amazon.com/dp/B0CM5JV268',
    'www.amazon.com/dp/B0CM5JV268',
  ])('accepts allowlisted Amazon host: %s', (input) => {
    const result = parseRetailerUrl(input);
    expect(result).toEqual({
      ok: true,
      platform: 'amazon',
      id: 'B0CM5JV268',
      canonicalUrl: 'https://www.amazon.com/dp/B0CM5JV268',
    });
  });

  it('rejects a non-allowlisted host', () => {
    const result = parseRetailerUrl('https://www.walmart.com/ip/12345');
    expect(result).toEqual({
      ok: false,
      code: 'URL_HOST_NOT_ALLOWED',
      message: expect.any(String),
    });
  });

  it('rejects userinfo in the URL', () => {
    const result = parseRetailerUrl('https://user:pass@www.amazon.com/dp/B0CM5JV268');
    expect(result).toMatchObject({ ok: false, code: 'URL_HOST_NOT_ALLOWED' });
  });

  it('rejects a non-default port', () => {
    const result = parseRetailerUrl('https://www.amazon.com:8443/dp/B0CM5JV268');
    expect(result).toMatchObject({ ok: false, code: 'URL_HOST_NOT_ALLOWED' });
  });

  it('rejects an IPv4-literal host', () => {
    const result = parseRetailerUrl('https://192.168.1.1/dp/B0CM5JV268');
    expect(result).toMatchObject({ ok: false, code: 'URL_HOST_NOT_ALLOWED' });
  });
});

describe('parseRetailerUrl — Amazon ASIN extraction (TR-INT-03/05)', () => {
  it.each([
    ['https://www.amazon.com/Sony-WH-1000XM5/dp/B0CM5JV268/ref=sr_1_1', 'B0CM5JV268'],
    ['https://www.amazon.com/gp/product/B0CM5JV268', 'B0CM5JV268'],
    ['https://www.amazon.com/gp/aw/d/B0CM5JV268', 'B0CM5JV268'],
    ['https://www.amazon.com/exec/obidos/ASIN/B0CM5JV268/', 'B0CM5JV268'],
  ])('extracts ASIN from %s', (input, expectedAsin) => {
    const result = parseRetailerUrl(input);
    expect(result).toEqual({
      ok: true,
      platform: 'amazon',
      id: expectedAsin,
      canonicalUrl: `https://www.amazon.com/dp/${expectedAsin}`,
    });
  });

  it('discards original query params when rebuilding the canonical URL', () => {
    const result = parseRetailerUrl(
      'https://www.amazon.com/dp/B0CM5JV268?tag=someones-affiliate-id&th=1',
    );
    expect(result).toEqual({
      ok: true,
      platform: 'amazon',
      id: 'B0CM5JV268',
      canonicalUrl: 'https://www.amazon.com/dp/B0CM5JV268',
    });
  });

  it('flags an Amazon URL with no recognizable ASIN', () => {
    const result = parseRetailerUrl('https://www.amazon.com/s?k=headphones');
    expect(result).toMatchObject({ ok: false, code: 'URL_ID_NOT_FOUND' });
  });
});

describe('parseRetailerUrl — eBay item ID extraction (TR-INT-03/05)', () => {
  it('extracts the item id from /itm/', () => {
    const result = parseRetailerUrl('https://www.ebay.com/itm/123456789012');
    expect(result).toEqual({
      ok: true,
      platform: 'ebay',
      id: '123456789012',
      canonicalUrl: 'https://www.ebay.com/itm/123456789012',
    });
  });

  it('extracts the item id when a title slug precedes it', () => {
    const result = parseRetailerUrl('https://www.ebay.com/itm/Sony-Headphones-Black/123456789012');
    expect(result).toMatchObject({ ok: true, platform: 'ebay', id: '123456789012' });
  });

  it('extracts the item id alongside an optional variation param', () => {
    const result = parseRetailerUrl('https://www.ebay.com/itm/123456789012?var=987654321');
    expect(result).toMatchObject({ ok: true, platform: 'ebay', id: '123456789012' });
  });

  it('flags an eBay URL with no recognizable item id', () => {
    const result = parseRetailerUrl('https://www.ebay.com/sch/i.html?_nkw=headphones');
    expect(result).toMatchObject({ ok: false, code: 'URL_ID_NOT_FOUND' });
  });
});

describe('parseRetailerUrl — Best Buy SKU extraction (TR-INT-03/05)', () => {
  it('extracts the SKU from the path', () => {
    const result = parseRetailerUrl('https://www.bestbuy.com/site/6408356.p?skuId=6408356');
    expect(result).toEqual({
      ok: true,
      platform: 'bestbuy',
      id: '6408356',
      canonicalUrl: 'https://www.bestbuy.com/site/6408356.p?skuId=6408356',
    });
  });

  it('extracts the SKU from a skuId query param when the path has none', () => {
    const result = parseRetailerUrl('https://www.bestbuy.com/site/sony-headphones?skuId=6408356');
    expect(result).toMatchObject({ ok: true, platform: 'bestbuy', id: '6408356' });
  });

  it('flags a Best Buy URL with no recognizable SKU', () => {
    const result = parseRetailerUrl('https://www.bestbuy.com/site/searchpage.jsp?st=headphones');
    expect(result).toMatchObject({ ok: false, code: 'URL_ID_NOT_FOUND' });
  });
});

describe('parseRetailerUrl — short links (TR-INT-04)', () => {
  it.each(['https://amzn.to/3xyzabc', 'https://a.co/d/abc123', 'https://ebay.us/m/abc123'])(
    'rejects short link %s with the friendly message',
    (input) => {
      const result = parseRetailerUrl(input);
      expect(result).toEqual({
        ok: false,
        code: 'URL_SHORTLINK_UNSUPPORTED',
        message: expect.stringContaining("Short links can't be checked"),
      });
    },
  );
});
