import { createHash } from 'node:crypto';
import { env } from '../../config/env.js';
import { PlagSearchCache } from '../../models/Plagiarism.js';
import { LIMITS } from './limits.js';

const SEARCH_URL = 'https://api.tavily.com/search';

export function tavilyConfigured() {
  return Boolean(env.tavilyApiKey);
}

function queryHash(query) {
  return createHash('sha256').update(String(query || '')).digest('hex');
}

function hostOf(url) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return '';
  }
}

/** Normalize Tavily result rows into { url, title, text }. */
export function normalizeTavilyResults(payload) {
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  const out = [];
  const seen = new Set();
  for (const row of rows) {
    const url = typeof row?.url === 'string' ? row.url.trim() : '';
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const raw = typeof row.raw_content === 'string' ? row.raw_content.trim() : '';
    const content = typeof row.content === 'string' ? row.content.trim() : '';
    const text = raw.length >= LIMITS.minSnippetChars ? raw : content.length >= LIMITS.minSnippetChars ? content : raw || content;
    out.push({
      url,
      host: hostOf(url),
      title: (row.title || '').trim().slice(0, 180),
      text: text || '',
    });
  }
  return out;
}

async function takeSearchCache(query) {
  const doc = await PlagSearchCache.findOne({ queryHash: queryHash(query) }).lean();
  if (!doc?.fetchedAt) return null;
  if (Date.now() - new Date(doc.fetchedAt).getTime() > LIMITS.searchCacheTtlMs) return null;
  return Array.isArray(doc.results) ? doc.results : [];
}

async function saveSearchCache(query, results) {
  await PlagSearchCache.findOneAndUpdate(
    { queryHash: queryHash(query) },
    { $set: { query: String(query).slice(0, 500), results, fetchedAt: new Date() } },
    { upsert: true }
  );
}

export async function searchTavily(query, { fetchImpl = globalThis.fetch, maxResults = LIMITS.tavilyMaxResults, takeCached = takeSearchCache, saveCached = saveSearchCache } = {}) {
  const cached = await takeCached(query);
  if (cached) return { results: cached, credits: 0, cached: true };
  if (!tavilyConfigured()) throw new Error('Tavily is not configured');

  const res = await fetchImpl(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.tavilyApiKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: 'basic',
      max_results: maxResults,
      include_raw_content: true,
      topic: 'general',
    }),
    signal: AbortSignal.timeout(LIMITS.timeoutMs),
  });
  if (!res.ok) throw new Error(`Tavily search failed (${res.status})`);
  const results = normalizeTavilyResults(await res.json());
  await saveCached(query, results);
  return { results, credits: 1, cached: false };
}
