import { env } from '../../config/env.js';
import { LIMITS } from './limits.js';

const WORKS_URL = 'https://api.openalex.org/works';

export function openAlexConfigured() {
  return Boolean(env.openAlexMailto || env.openAlexApiKey);
}

function hostOf(url) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return '';
  }
}

function topicQuery(title, words) {
  const fromTitle = String(title || '')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 8)
    .join(' ');
  if (fromTitle) return fromTitle;
  return (words || [])
    .filter((w) => w.length > 4)
    .slice(0, 10)
    .join(' ');
}

/** Prefer HTML OA landings first; PDFs are last because the fetcher skips application/pdf. */
export function oaUrlsFromWork(work) {
  const urls = [];
  const push = (raw) => {
    if (typeof raw !== 'string' || !/^https?:\/\//i.test(raw)) return;
    urls.push(raw.split('#')[0]);
  };
  push(work?.primary_location?.landing_page_url);
  push(work?.open_access?.oa_url);
  for (const loc of work?.locations || []) {
    if (!loc?.is_oa) continue;
    push(loc.landing_page_url);
  }
  push(work?.primary_location?.pdf_url);
  for (const loc of work?.locations || []) {
    if (!loc?.is_oa) continue;
    push(loc.pdf_url);
  }
  const seen = new Set();
  return urls.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

export function normalizeOpenAlexWorks(payload) {
  const works = Array.isArray(payload?.results) ? payload.results : [];
  const out = [];
  const seen = new Set();
  for (const work of works) {
    const title = (work?.display_name || work?.title || '').trim().slice(0, 180);
    for (const url of oaUrlsFromWork(work)) {
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ url, host: hostOf(url), title, text: '' });
    }
  }
  return out;
}

export async function searchOpenAlex({ title = '', words = [], fetchImpl = globalThis.fetch, limit = LIMITS.openAlexWorks } = {}) {
  if (!openAlexConfigured()) return { results: [], hits: 0 };
  const q = topicQuery(title, words);
  if (!q) return { results: [], hits: 0 };

  const params = new URLSearchParams({
    search: q,
    filter: 'is_oa:true',
    per_page: String(Math.min(25, Math.max(1, limit))),
    sort: 'relevance_score:desc',
  });
  if (env.openAlexMailto) params.set('mailto', env.openAlexMailto);
  if (env.openAlexApiKey) params.set('api_key', env.openAlexApiKey);

  const res = await fetchImpl(`${WORKS_URL}?${params}`, {
    headers: { Accept: 'application/json', 'User-Agent': `ResearchPatraBot/1.0 (mailto:${env.openAlexMailto || 'researchpatra@gmail.com'})` },
    signal: AbortSignal.timeout(LIMITS.timeoutMs),
  });
  if (!res.ok) throw new Error(`OpenAlex search failed (${res.status})`);
  const results = normalizeOpenAlexWorks(await res.json()).slice(0, limit);
  return { results, hits: results.length };
}
