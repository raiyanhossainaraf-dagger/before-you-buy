import type { Platform } from '@byb/schemas';

/** TR-INT-02: exact host allowlist. */
const ALLOWED_HOSTS = new Set([
  'amazon.com',
  'www.amazon.com',
  'm.amazon.com',
  'ebay.com',
  'www.ebay.com',
  'm.ebay.com',
  'bestbuy.com',
  'www.bestbuy.com',
]);

/** TR-INT-04: known shortlink hosts that can't be resolved without fetching them. */
const SHORTLINK_HOSTS = new Set(['amzn.to', 'a.co', 'ebay.us']);

const SHORTLINK_MESSAGE =
  "Short links can't be checked. Open the product and copy the full link from the address bar.";
const UNSUPPORTED_HOST_MESSAGE = "We only check links from Amazon, eBay or Best Buy.";
const ID_NOT_FOUND_MESSAGE = "We couldn't find a product in that link.";

export type RetailerUrlResult =
  | { ok: true; platform: Platform; id: string; canonicalUrl: string }
  | {
      ok: false;
      code: 'URL_SHORTLINK_UNSUPPORTED' | 'URL_HOST_NOT_ALLOWED' | 'URL_ID_NOT_FOUND';
      message: string;
    };

function isIpLiteralHost(hostname: string): boolean {
  if (hostname.includes(':')) return true; // IPv6
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function matchAsin(pathname: string): string | null {
  const match = pathname.match(
    /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/ASIN)\/([A-Za-z0-9]{10})(?:[/?]|$)/,
  );
  return match?.[1] ? match[1].toUpperCase() : null;
}

function matchEbayItemId(pathname: string): string | null {
  const match = pathname.match(/\/itm\/(?:[^/]+\/)?(\d{9,15})(?:[/?]|$)/);
  return match?.[1] ?? null;
}

function matchBestBuySku(url: URL): string | null {
  const fromQuery = url.searchParams.get('skuId');
  if (fromQuery && /^\d{6,8}$/.test(fromQuery)) return fromQuery;
  const fromPath = url.pathname.match(/\/(\d{6,8})\.p(?:[/?]|$)/);
  return fromPath?.[1] ?? null;
}

/** TR-INT-03/05: identifier extraction and canonical URL rebuild, per platform. */
function resolveListing(host: string, url: URL): RetailerUrlResult {
  if (host.endsWith('amazon.com')) {
    const asin = matchAsin(url.pathname);
    if (!asin) return { ok: false, code: 'URL_ID_NOT_FOUND', message: ID_NOT_FOUND_MESSAGE };
    return { ok: true, platform: 'amazon', id: asin, canonicalUrl: `https://www.amazon.com/dp/${asin}` };
  }
  if (host.endsWith('ebay.com')) {
    const itemId = matchEbayItemId(url.pathname);
    if (!itemId) return { ok: false, code: 'URL_ID_NOT_FOUND', message: ID_NOT_FOUND_MESSAGE };
    return { ok: true, platform: 'ebay', id: itemId, canonicalUrl: `https://www.ebay.com/itm/${itemId}` };
  }
  const sku = matchBestBuySku(url);
  if (!sku) return { ok: false, code: 'URL_ID_NOT_FOUND', message: ID_NOT_FOUND_MESSAGE };
  return {
    ok: true,
    platform: 'bestbuy',
    id: sku,
    canonicalUrl: `https://www.bestbuy.com/site/${sku}.p?skuId=${sku}`,
  };
}

/**
 * TR-INT-02..05. Never fetches the URL (rule 2) — everything here is string
 * parsing. Returns `null` when `rawInput` isn't URL-shaped at all, so the
 * caller treats it as a text search query instead.
 */
export function parseRetailerUrl(rawInput: string): RetailerUrlResult | null {
  const raw = rawInput.trim();
  if (!raw || /\s/.test(raw)) return null;

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
  let url: URL;
  try {
    url = new URL(hasScheme ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const isKnownHost = ALLOWED_HOSTS.has(host) || SHORTLINK_HOSTS.has(host);
  // A bare string that happens to parse as a URL but isn't a known retailer
  // host is plain query text (e.g. "ipad 10.9 inch"), not a pasted link.
  if (!hasScheme && !isKnownHost) return null;

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.port ||
    isIpLiteralHost(host)
  ) {
    return { ok: false, code: 'URL_HOST_NOT_ALLOWED', message: UNSUPPORTED_HOST_MESSAGE };
  }

  if (SHORTLINK_HOSTS.has(host)) {
    return { ok: false, code: 'URL_SHORTLINK_UNSUPPORTED', message: SHORTLINK_MESSAGE };
  }

  if (!ALLOWED_HOSTS.has(host)) {
    return { ok: false, code: 'URL_HOST_NOT_ALLOWED', message: UNSUPPORTED_HOST_MESSAGE };
  }

  return resolveListing(host, url);
}

/** TR-INT-06: Unicode NFKC → lowercase → collapse whitespace → strip punctuation → trim. */
export function normalizeQuery(raw: string): string {
  const lowered = raw.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ');
  const stripped = lowered.replace(/[^a-z0-9 \-/.+"]/g, '');
  return stripped.replace(/\s+/g, ' ').trim();
}
