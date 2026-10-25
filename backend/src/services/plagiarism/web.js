import { stripTags } from '../../utils/html.js';
import { LIMITS } from './limits.js';
import { pickQueries } from './text.js';
import { selectUrls } from './search.js';

export const INCOMPLETE_SEARCH = 'Web search did not respond, so this check is incomplete.';
export const INCOMPLETE_TEXT = 'There was not enough distinctive text to search the web.';
export const INCOMPLETE_BUDGET = 'The daily page limit was reached before the web check finished.';
export const INCOMPLETE_PAGES = 'The web pages could not be opened, so this check is incomplete.';
export const INCOMPLETE_EXTERNAL = 'External verification incomplete. No usable web or academic sources were found.';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPool(items, { concurrency, gapMs, shouldStop }, fn) {
  if (!items.length) return;
  let index = 0;
  let chain = Promise.resolve();
  const waitTurn = () => {
    const run = chain.then(() => (gapMs ? sleep(gapMs) : null));
    chain = run.catch(() => {});
    return run;
  };
  const worker = async () => {
    for (;;) {
      if (shouldStop()) return;
      const current = index;
      index += 1;
      if (current >= items.length) return;
      await waitTurn();
      if (shouldStop()) return;
      await fn(items[current]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
}

export function htmlTitle(html) {
  const match = /<title[^>]*>([^<]{1,180})<\/title>/i.exec(html || '');
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

async function readLimited(res, maxBytes) {
  if (!res.body?.getReader) {
    const buf = await res.arrayBuffer();
    return new TextDecoder().decode(buf.slice(0, maxBytes));
  }
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    if (received >= maxBytes) {
      await reader.cancel().catch(() => {});
      break;
    }
  }
  const size = Math.min(received, maxBytes);
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    const take = Math.min(chunk.byteLength, size - offset);
    all.set(chunk.subarray(0, take), offset);
    offset += take;
    if (offset >= size) break;
  }
  return new TextDecoder().decode(all);
}

export async function fetchHtmlPage(url, fetchImpl = globalThis.fetch, ownHosts = new Set()) {
  const res = await fetchImpl(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(LIMITS.timeoutMs),
    headers: {
      'User-Agent': 'ResearchPatraBot/1.0 (+https://researchpatra.com)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  try {
    if (ownHosts.has(new URL(res.url || url).host)) return { skip: true };
  } catch {
    return { skip: true };
  }
  const type = res.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml|text\/plain|application\/pdf/i.test(type) && type) {
    // Allow empty content-type; reject known non-text binaries later via empty strip.
  }
  if (/application\/pdf/i.test(type)) return { skip: true };
  const html = await readLimited(res, LIMITS.maxBytes);
  const text = stripTags(html);
  if (!text) return { skip: true };
  return { text, title: htmlTitle(html) };
}

function asHits(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        try {
          const url = new URL(item).toString();
          return { url, host: new URL(url).host.toLowerCase(), title: '', text: '' };
        } catch {
          return null;
        }
      }
      if (!item?.url) return null;
      try {
        const url = new URL(item.url).toString();
        return {
          url,
          host: item.host || new URL(url).host.toLowerCase(),
          title: item.title || '',
          text: item.text || '',
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function usableText(text, minChars = LIMITS.minSnippetChars) {
  return typeof text === 'string' && text.trim().length >= minChars;
}

/**
 * Search (web + optional academic), then fetch a bounded set of pages.
 * Usable snippet text from search counts as coverage without a fetch.
 * Zero usable pages always means incomplete — never a clean external result.
 */
export async function runWebStage({
  words,
  title = '',
  search,
  academicSearch,
  takeCached,
  consume,
  fetchPage,
  savePage,
  ownHosts,
  skipAcademic = false,
  limits = LIMITS,
}) {
  const queries = pickQueries(words, limits.queries);
  const empty = {
    queries: queries.length,
    fetched: 0,
    failed: 0,
    cached: 0,
    snippets: 0,
    tavilyCredits: 0,
    openAlexHits: 0,
    pages: [],
  };
  if (!queries.length) return { ...empty, complete: false, reason: INCOMPLETE_TEXT };

  const found = [];
  const snippetPages = [];
  const seenUrls = new Set();
  let tavilyCredits = 0;
  let openAlexHits = 0;
  let queriesRun = 0;

  const addHits = (hits, { countSnippet = true } = {}) => {
    for (const hit of asHits(hits)) {
      if (ownHosts?.has?.(hit.host)) continue;
      if (seenUrls.has(hit.url)) {
        if (countSnippet && usableText(hit.text) && !snippetPages.some((p) => p.url === hit.url)) {
          snippetPages.push({ ...hit, text: hit.text, title: hit.title || hit.host });
        }
        continue;
      }
      seenUrls.add(hit.url);
      found.push(hit.url);
      if (countSnippet && usableText(hit.text)) {
        snippetPages.push({ ...hit, text: hit.text, title: hit.title || hit.host });
      }
    }
  };

  for (const query of queries) {
    try {
      const packed = await search(query);
      const hits = Array.isArray(packed) ? packed : packed?.results;
      tavilyCredits += Number(packed?.credits) || 0;
      addHits(hits);
      queriesRun += 1;
      if (queriesRun >= (limits.earlyStopQueries || 2) && snippetPages.length >= (limits.earlyStopPages || 3)) break;
    } catch {
      return { ...empty, queries: queriesRun || queries.length, complete: false, reason: INCOMPLETE_SEARCH };
    }
  }

  if (!skipAcademic && academicSearch) {
    try {
      const academic = await academicSearch({ title, words });
      const hits = Array.isArray(academic) ? academic : academic?.results;
      openAlexHits = Number(academic?.hits) || asHits(hits).length;
      addHits(hits, { countSnippet: false });
    } catch {
      // Academic discovery is additive; a failure does not wipe Tavily pages already found.
    }
  }

  const already = new Set(snippetPages.map((p) => p.url));
  const planned = selectUrls(
    found.filter((url) => !already.has(url)),
    { limit: Math.max(0, (limits.pages || 12) - snippetPages.length), perHost: limits.perHost, skipHosts: ownHosts }
  );

  const pages = [...snippetPages];
  let fetched = 0;
  let failed = 0;
  let cached = 0;
  let stopped = false;
  let reason = '';

  await runPool(planned, { concurrency: limits.concurrency, gapMs: limits.gapMs, shouldStop: () => stopped }, async (item) => {
    const cachedPage = await takeCached(item.url);
    if (cachedPage?.text) {
      cached += 1;
      pages.push({ ...item, text: cachedPage.text, title: cachedPage.title || item.title || '' });
      return;
    }

    let page = null;
    for (let attempt = 0; attempt <= limits.retries; attempt += 1) {
      if (stopped) return;
      const allowed = await consume();
      if (!allowed) {
        stopped = true;
        reason = INCOMPLETE_BUDGET;
        return;
      }
      try {
        const result = await fetchPage(item.url);
        if (result?.skip) break;
        if (result?.text) {
          page = result;
          break;
        }
      } catch {
        page = null;
      }
    }

    if (page?.text) {
      fetched += 1;
      pages.push({ ...item, text: page.text, title: page.title || item.title || '' });
      if (savePage) await savePage(item, page);
      return;
    }
    failed += 1;
  });

  const snippets = snippetPages.length;
  if (!stopped && pages.length === 0) {
    stopped = true;
    reason = planned.length > 0 ? INCOMPLETE_PAGES : INCOMPLETE_EXTERNAL;
  }

  return {
    complete: !stopped && pages.length > 0,
    reason: stopped ? reason : pages.length ? '' : INCOMPLETE_EXTERNAL,
    queries: queriesRun || queries.length,
    fetched,
    failed,
    cached,
    snippets,
    tavilyCredits,
    openAlexHits,
    pages,
  };
}
