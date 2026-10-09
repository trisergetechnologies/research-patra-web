import { LIMITS } from './limits.js';

export function containment(articleShingles, sourceShingles) {
  const article = articleShingles instanceof Set ? articleShingles : new Set(articleShingles);
  if (!article.size) return 0;
  const source = sourceShingles instanceof Set ? sourceShingles : new Set(sourceShingles);
  let hit = 0;
  for (const hash of article) if (source.has(hash)) hit += 1;
  return hit / article.size;
}

export function withoutSelf(sources, postId) {
  const id = String(postId);
  return sources.filter((source) => String(source.postId) !== id);
}

function overlapLength(a0, a1, b0, b1) {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

function excerptOf(words, start, end) {
  const slice = words.slice(start, end);
  const shown = slice.slice(0, LIMITS.excerptWords).join(' ');
  return slice.length > LIMITS.excerptWords ? `${shown}…` : shown;
}

export function passagesForSource(words, sh5, sh8, source5, source8, quoteRanges) {
  const set5 = new Set(source5);
  const set8 = new Set(source8);
  const ranges = [];
  let start = -1;
  for (let i = 0; i <= sh5.length; i += 1) {
    const hit = i < sh5.length && set5.has(sh5[i]);
    if (hit) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      ranges.push([start, i - 1 + 5]);
      start = -1;
    }
  }
  const merged = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] - last[1] <= 8) last[1] = range[1];
    else merged.push(range);
  }
  return merged
    .filter(([from, to]) => to - from >= LIMITS.minPassageWords)
    .map(([from, to]) => {
      const quotation = (quoteRanges || []).some(([q0, q1]) => overlapLength(from, to, q0, q1) >= 0.6 * (to - from));
      const nearCopy = sh8.some((hash, index) => index >= from && index + 8 <= to && set8.has(hash));
      return {
        startWord: from,
        endWord: to,
        words: to - from,
        excerpt: excerptOf(words, from, to),
        nearCopy,
        quotation,
      };
    });
}

function sourceMeta(source) {
  return {
    kind: source.kind,
    postId: source.postId ? String(source.postId) : null,
    target: source.target || null,
    title: source.title || source.host || 'Source',
    slug: source.slug || null,
    url: source.url || null,
    host: source.host || null,
  };
}

function wholeArticlePassage(words) {
  return {
    startWord: 0,
    endWord: words.length,
    words: words.length,
    excerpt: excerptOf(words, 0, words.length),
    nearCopy: true,
    quotation: false,
  };
}

/** Share of this article found in `sources`, plus the passages worth showing. */
export function compareAgainst(article, sources) {
  const articleSet = new Set(article.sh5);
  const matched = new Set();
  const hits = [];
  let longest = 0;

  for (const source of sources) {
    for (const hash of source.sh5 || []) if (articleSet.has(hash)) matched.add(hash);
    const exact = Boolean(article.hash) && article.hash === source.hash;
    const overlap = exact ? 1 : containment(articleSet, source.sh5 || []);
    const passages = exact && article.words.length
      ? [wholeArticlePassage(article.words)]
      : passagesForSource(article.words, article.sh5, article.sh8, source.sh5 || [], source.sh8 || [], article.quoteRanges);
    for (const passage of passages) if (passage.words > longest) longest = passage.words;
    if (exact || overlap >= LIMITS.sourceFloor || passages.length) {
      hits.push({ ...sourceMeta(source), overlap, exact, passages });
    }
  }

  hits.sort((a, b) => b.overlap - a.overlap);
  return {
    overlap: articleSet.size ? matched.size / articleSet.size : 0,
    longest,
    sources: hits.slice(0, LIMITS.maxSources),
  };
}
