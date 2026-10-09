import assert from 'node:assert/strict';
import test from 'node:test';
import { compareAgainst, containment, passagesForSource, withoutSelf } from './match.js';
import { parseSearchResults, selectUrls } from './search.js';
import { chipFor, decideEnqueue, staleAction } from './status.js';
import { pickQueries, prepareArticle } from './text.js';
import { decideVerdict } from './verdict.js';
import { runWebStage } from './web.js';

const words = (text) => text.split(/\s+/).filter(Boolean);

function articleFrom(text, html) {
  return prepareArticle({ title: '', contentHtml: html || `<p>${text}</p>`, keyTakeaways: [] });
}

test('normalization and hash ignore tags and extra space', () => {
  const a = prepareArticle({ title: 'Hello', contentHtml: '<p>Hello   <strong>World</strong></p>', keyTakeaways: ['One'] });
  const b = prepareArticle({ title: '  hello ', contentHtml: 'Hello World', keyTakeaways: ['One'] });
  assert.equal(a.hash, b.hash);
  assert.deepEqual(a.words, ['hello', 'hello', 'world', 'one']);
  const changed = prepareArticle({ title: 'Hello', contentHtml: '<p>Hello World</p>', keyTakeaways: ['Two'] });
  assert.notEqual(a.hash, changed.hash);
});

test('queries are spread through a long article and capped', () => {
  const body = Array.from({ length: 400 }, (_, i) => `uniqueword${i}`);
  const queries = pickQueries(body, 12);
  assert.equal(queries.length, 12);
  assert.ok(queries.every((query) => query.startsWith('"') && query.endsWith('"')));
  assert.notEqual(queries[0], queries[11]);
  assert.deepEqual(pickQueries(['too', 'short'], 12), []);
});

test('overlap, passages, quotations, and same-post exclusion', () => {
  const copied = Array.from({ length: 50 }, (_, i) => `copied${i}`).join(' ');
  const intro = Array.from({ length: 10 }, (_, i) => `intro${i}`).join(' ');
  const outro = Array.from({ length: 10 }, (_, i) => `outro${i}`).join(' ');
  const text = `${intro} ${copied} ${outro}`;
  const html = `<p>${intro}</p><blockquote><p>${copied}</p></blockquote><p>${outro}</p>`;
  const article = articleFrom(text, html);
  const sourceWords = words(`prefix ${copied} suffix extra padding words here`);
  const source = prepareArticle({ title: '', contentHtml: `<p>${sourceWords.join(' ')}</p>`, keyTakeaways: [] });
  const unrelated = prepareArticle({ title: 'Other', contentHtml: '<p>nothing shared with the article at all beyond tiny words</p>', keyTakeaways: [] });

  const passages = passagesForSource(article.words, article.sh5, article.sh8, source.sh5, source.sh8, article.quoteRanges);
  assert.ok(passages.length >= 1);
  assert.ok(passages.some((passage) => passage.words >= 40 && passage.quotation && passage.nearCopy));

  const compared = compareAgainst(article, [
    { kind: 'internal', postId: 'self', target: 'live', title: 'This article', hash: article.hash, sh5: article.sh5, sh8: article.sh8 },
    { kind: 'internal', postId: 'other', target: 'live', title: 'Other', slug: 'other', hash: source.hash, sh5: source.sh5, sh8: source.sh8 },
    { kind: 'internal', postId: 'far', target: 'live', title: 'Far', hash: unrelated.hash, sh5: unrelated.sh5, sh8: unrelated.sh8 },
  ]);
  const kept = withoutSelf(compared.sources, 'self');
  assert.equal(kept.some((hit) => hit.postId === 'self'), false);
  const other = kept.find((hit) => hit.postId === 'other');
  assert.ok(other);
  assert.ok(other.overlap > 0.2);
  assert.equal(containment(article.sh5, source.sh5) > 0.2, true);
  assert.equal(compared.sources.some((hit) => hit.postId === 'far'), false);
});

test('verdict stays incomplete unless the web stage finishes', () => {
  assert.equal(decideVerdict({ webComplete: false, internalOverlap: 0, webOverlap: 0, longestRun: 0 }), 'incomplete');
  assert.equal(decideVerdict({ webComplete: false, internalOverlap: 0.9, webOverlap: 0.4, longestRun: 120 }), 'incomplete');
  assert.equal(decideVerdict({ webComplete: true, internalOverlap: 0.01, webOverlap: 0, longestRun: 10 }), 'clear');
  assert.equal(decideVerdict({ webComplete: true, internalOverlap: 0.1, webOverlap: 0.02, longestRun: 20 }), 'review');
  assert.equal(decideVerdict({ webComplete: true, internalOverlap: 0.25, webOverlap: 0, longestRun: 10 }), 'strong');
  assert.equal(decideVerdict({ webComplete: true, internalOverlap: 0.05, webOverlap: 0, longestRun: 80 }), 'strong');
});

test('search results keep real pages and drop the search engine itself', () => {
  const html = `
    <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fone&amp;rut=1">One</a>
    <a href="https://news.example/skip" class="other">Skip</a>
    <a class="result__a" href="https://news.example/story">Direct</a>
    <a class="result__a" href="https://duckduckgo.com/about">About</a>
  `;
  assert.deepEqual(parseSearchResults(html), ['https://example.com/one', 'https://news.example/story']);
});

test('page selection respects the page cap, the per-site cap, and this site', () => {
  const urls = [
    ...Array.from({ length: 6 }, (_, i) => `https://alpha.example/p${i}`),
    ...Array.from({ length: 6 }, (_, i) => `https://beta.example/p${i}`),
    'https://researchpatra.com/blog/already-here',
    'not a url',
    'ftp://files.example/a',
  ];
  const selected = selectUrls(urls, { limit: 24, perHost: 4, skipHosts: new Set(['researchpatra.com']) });
  assert.equal(selected.length, 8);
  assert.equal(selected.filter((item) => item.host === 'alpha.example').length, 4);
  assert.equal(selected.filter((item) => item.host === 'beta.example').length, 4);
  const capped = selectUrls(urls, { limit: 3, perHost: 4, skipHosts: new Set() });
  assert.equal(capped.length, 3);
});

test('enqueue keeps an active or finished scan and retries a failed one', () => {
  assert.equal(decideEnqueue([]).action, 'create');
  assert.equal(decideEnqueue([{ status: 'queued', contentHash: 'a' }]).action, 'keep');
  assert.equal(decideEnqueue([{ status: 'running', contentHash: 'a' }]).action, 'keep');
  assert.equal(decideEnqueue([{ status: 'complete', contentHash: 'a' }]).action, 'keep');
  assert.equal(decideEnqueue([{ status: 'incomplete', contentHash: 'a' }]).action, 'create');
  assert.equal(decideEnqueue([{ status: 'failed', contentHash: 'a' }]).action, 'create');
});

test('a changed article is out of date and a missing scan is not checked', () => {
  assert.deepEqual(chipFor(null, 'hash'), { status: 'none', verdict: null, stale: false });
  const current = chipFor({ status: 'complete', verdict: 'clear', contentHash: 'same' }, 'same');
  assert.equal(current.status, 'complete');
  assert.equal(current.stale, false);
  const edited = chipFor({ status: 'complete', verdict: 'clear', contentHash: 'old' }, 'new');
  assert.equal(edited.status, 'stale');
  assert.equal(edited.stale, true);
  assert.equal(chipFor({ status: 'failed', verdict: null, contentHash: 'same' }, 'same').status, 'failed');
});

test('a stuck scan is retried once and then marked incomplete', () => {
  const now = Date.parse('2026-10-09T12:00:00Z');
  const fresh = { status: 'running', startedAt: new Date(now - 60 * 1000), requeues: 0 };
  const stuck = { status: 'running', startedAt: new Date(now - 16 * 60 * 1000), requeues: 0 };
  const retried = { status: 'running', startedAt: new Date(now - 16 * 60 * 1000), requeues: 1 };
  assert.equal(staleAction(fresh, now), null);
  assert.equal(staleAction(stuck, now), 'requeue');
  assert.equal(staleAction(retried, now), 'incomplete');
  assert.equal(staleAction({ status: 'queued', startedAt: stuck.startedAt, requeues: 0 }, now), null);
});

const limits = { queries: 12, pages: 24, perHost: 4, concurrency: 2, gapMs: 0, retries: 2 };

function longWords() {
  return Array.from({ length: 48 }, (_, i) => `uniqueword${i}`);
}

test('the daily cap stops the web check before it is called finished', async () => {
  let fetches = 0;
  const result = await runWebStage({
    words: longWords(),
    ownHosts: new Set(),
    limits,
    search: async () => ['https://alpha.example/a', 'https://beta.example/b'],
    takeCached: async () => null,
    consume: async () => false,
    fetchPage: async () => {
      fetches += 1;
      return { text: 'should not be read' };
    },
  });
  assert.equal(fetches, 0);
  assert.equal(result.complete, false);
  assert.match(result.reason, /daily page limit/);
});

test('fetch limits, host caps, and retries are enforced', async () => {
  const seen = [];
  let attempts = 0;
  const urls = [
    ...Array.from({ length: 6 }, (_, i) => `https://alpha.example/p${i}`),
    ...Array.from({ length: 3 }, (_, i) => `https://beta.example/p${i}`),
    'https://researchpatra.com/blog/mine',
  ];
  const result = await runWebStage({
    words: longWords(),
    ownHosts: new Set(['researchpatra.com']),
    limits: { ...limits, pages: 5, perHost: 2 },
    search: async () => urls,
    takeCached: async (url) => (url.endsWith('/p0') && url.includes('alpha') ? { text: 'cached page about unique words', title: 'Cached' } : null),
    consume: async () => true,
    fetchPage: async (url) => {
      attempts += 1;
      seen.push(url);
      if (url.includes('beta')) {
        if (attempts < 100 && seen.filter((item) => item === url).length < 3) throw new Error('temporary');
      }
      return { text: `page text for ${url} with enough unique words to compare later`, title: 'Page' };
    },
  });

  assert.equal(result.complete, true);
  assert.equal(result.cached, 1);
  assert.ok(result.pages.length <= 5);
  assert.ok(result.pages.filter((page) => page.host === 'alpha.example').length <= 2);
  assert.equal(seen.some((url) => url.includes('researchpatra.com')), false);
  const beta = seen.filter((url) => url.includes('beta.example/p'));
  assert.ok(beta.length >= 3);
  assert.equal(result.fetched + result.cached, result.pages.length);
});

test('a search that does not respond is an incomplete check', async () => {
  const result = await runWebStage({
    words: longWords(),
    ownHosts: new Set(),
    limits,
    search: async () => {
      throw new Error('down');
    },
    takeCached: async () => null,
    consume: async () => true,
    fetchPage: async () => ({ text: 'unused' }),
  });
  assert.equal(result.complete, false);
  assert.match(result.reason, /Web search did not respond/);
  assert.equal(decideVerdict({ webComplete: result.complete, internalOverlap: 0, webOverlap: 0, longestRun: 0 }), 'incomplete');
});
