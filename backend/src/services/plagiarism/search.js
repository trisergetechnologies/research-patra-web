const SEARCH_URL = 'https://html.duckduckgo.com/html/';

export function decodeResultHref(href) {
  if (!href) return null;
  const cleaned = href.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/');
  try {
    const url = new URL(cleaned, 'https://duckduckgo.com');
    const wrapped = url.searchParams.get('uddg');
    const target = wrapped ? new URL(wrapped) : url;
    if (target.protocol !== 'http:' && target.protocol !== 'https:') return null;
    if (target.host === 'duckduckgo.com' || target.host.endsWith('.duckduckgo.com')) return null;
    target.hash = '';
    return target.toString();
  } catch {
    return null;
  }
}

export function parseSearchResults(html) {
  const urls = [];
  const seen = new Set();
  const tags = String(html || '').match(/<a\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/result__a/.test(tag)) continue;
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    const url = decodeResultHref(href);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

export function selectUrls(urls, { limit, perHost, skipHosts = new Set() } = {}) {
  const out = [];
  const hosts = new Map();
  const seen = new Set();
  for (const raw of urls) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      continue;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
    url.hash = '';
    const href = url.toString();
    const host = url.host.toLowerCase();
    if (skipHosts.has(host) || seen.has(href)) continue;
    const count = hosts.get(host) || 0;
    if (count >= perHost) continue;
    seen.add(href);
    hosts.set(host, count + 1);
    out.push({ url: href, host });
    if (out.length >= limit) break;
  }
  return out;
}

export async function searchDuckDuckGo(query, fetchImpl = globalThis.fetch) {
  const res = await fetchImpl(`${SEARCH_URL}?q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'ResearchPatraBot/1.0 (+https://researchpatra.com)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  return parseSearchResults(await res.text());
}
