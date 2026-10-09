import { stripTags } from '../../utils/html.js';
import { LIMITS } from './limits.js';
import { pickQueries } from './text.js';
import { selectUrls } from './search.js';

const INCOMPLETE_SEARCH = 'Web search did not respond, so this check is incomplete.';
const INCOMPLETE_TEXT = 'There was not enough distinctive text to search the web.';
const INCOMPLETE_BUDGET = 'The daily page limit was reached before the web check finished.';
const INCOMPLETE_PAGES = 'The web pages could not be opened, so this check is incomplete.';

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
      Accept: 'text/html',
    },
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  try {
    if (ownHosts.has(new URL(res.url || url).host)) return { skip: true };
  } catch {
    return { skip: true };
  }
  const type = res.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml/i.test(type)) return { skip: true };
  const html = await readLimited(res, LIMITS.maxBytes);
  const text = stripTags(html);
  if (!text) return { skip: true };
  return { text, title: htmlTitle(html) };
}

/**
 * Search, then fetch a bounded set of pages.
 * `consume` returns false when the daily cap is spent.
 * A page is retried `limits.retries` times, then counted as failed.
 */
export async function runWebStage({
  words,
  search,
  takeCached,
  consume,
  fetchPage,
  savePage,
  ownHosts,
  limits = LIMITS,
}) {
  const queries = pickQueries(words, limits.queries);
  const empty = { queries: queries.length, fetched: 0, failed: 0, cached: 0, pages: [] };
  if (!queries.length) return { ...empty, complete: false, reason: INCOMPLETE_TEXT };

  const found = [];
  for (const query of queries) {
    try {
      found.push(...(await search(query)));
    } catch {
      return { ...empty, complete: false, reason: INCOMPLETE_SEARCH };
    }
  }

  const planned = selectUrls(found, { limit: limits.pages, perHost: limits.perHost, skipHosts: ownHosts });
  const pages = [];
  let fetched = 0;
  let failed = 0;
  let cached = 0;
  let stopped = false;
  let reason = '';

  await runPool(planned, { concurrency: limits.concurrency, gapMs: limits.gapMs, shouldStop: () => stopped }, async (item) => {
    const cachedPage = await takeCached(item.url);
    if (cachedPage?.text) {
      cached += 1;
      pages.push({ ...item, text: cachedPage.text, title: cachedPage.title || '' });
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
      pages.push({ ...item, text: page.text, title: page.title || '' });
      if (savePage) await savePage(item, page);
      return;
    }
    failed += 1;
  });

  if (!stopped && planned.length > 0 && pages.length === 0) {
    stopped = true;
    reason = INCOMPLETE_PAGES;
  }

  return {
    complete: !stopped,
    reason,
    queries: queries.length,
    fetched,
    failed,
    cached,
    pages,
  };
}
