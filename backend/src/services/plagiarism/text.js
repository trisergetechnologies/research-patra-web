import { createHash } from 'node:crypto';
import { stripTags } from '../../utils/html.js';

const STOP = new Set(
  'a an the and or but if then so of to in on for with at by from as is are was were be been being it this that these those not no'.split(' ')
);

export function normalizeWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9']+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function hashWords(words) {
  return createHash('sha256').update(words.join(' ')).digest('hex');
}

function fnv(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shingles(words, size) {
  if (words.length < size) return [];
  const out = new Array(words.length - size + 1);
  for (let i = 0; i < out.length; i += 1) out[i] = fnv(words.slice(i, i + size).join(' '));
  return out;
}

export function uniqueShingles(list) {
  return [...new Set(list)];
}

function findSequence(hay, needle) {
  if (!needle.length || needle.length > hay.length) return -1;
  outer: for (let i = 0; i <= hay.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

export function quotationRanges(html, words) {
  const ranges = [];
  const re = /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let match = re.exec(html || '');
  while (match) {
    const quoted = normalizeWords(stripTags(match[1]));
    const at = findSequence(words, quoted);
    if (at >= 0) ranges.push([at, at + quoted.length]);
    match = re.exec(html || '');
  }
  return ranges;
}

export function prepareArticle({ title = '', contentHtml = '', keyTakeaways = [] } = {}) {
  const plain = [title, stripTags(contentHtml), (keyTakeaways || []).join(' ')].filter(Boolean).join('\n');
  const words = normalizeWords(plain);
  return {
    words,
    hash: hashWords(words),
    sh5: shingles(words, 5),
    sh8: shingles(words, 8),
    quoteRanges: quotationRanges(contentHtml, words),
    wordCount: words.length,
  };
}

export function scanTarget(post) {
  return post?.pendingRevision?.state === 'in_review' ? 'revision' : 'live';
}

export function scanSource(post) {
  const target = scanTarget(post);
  const src = target === 'revision' ? post.pendingRevision || {} : post || {};
  return {
    target,
    title: src.title || '',
    contentHtml: src.contentHtml || '',
    keyTakeaways: src.keyTakeaways || [],
  };
}

export function corpusEntries(post) {
  if (!post || post.deletedAt) return [];
  const entries = [];
  if (post.status === 'published' || post.status === 'in_review') {
    entries.push({
      target: 'live',
      title: post.title || '',
      contentHtml: post.contentHtml || '',
      keyTakeaways: post.keyTakeaways || [],
    });
  }
  if (post.pendingRevision?.state === 'in_review') {
    const rev = post.pendingRevision;
    entries.push({
      target: 'revision',
      title: rev.title || '',
      contentHtml: rev.contentHtml || '',
      keyTakeaways: rev.keyTakeaways || [],
    });
  }
  return entries;
}

function queryFrom(chunk) {
  return `"${chunk.slice(0, 14).join(' ')}"`;
}

/** Up to `limit` quoted phrases, spread through the article. */
export function pickQueries(words, limit) {
  const windows = [];
  for (let i = 0; i < words.length; i += 16) {
    const chunk = words.slice(i, i + 16);
    if (chunk.length < 8) continue;
    const score = chunk.filter((word) => word.length > 3 && !STOP.has(word)).length;
    if (score > 0) windows.push({ chunk, score });
  }
  if (!windows.length) return [];
  const buckets = Math.min(limit, windows.length);
  const size = windows.length / buckets;
  const picked = [];
  for (let i = 0; i < buckets; i += 1) {
    const slice = windows.slice(Math.floor(i * size), Math.max(Math.floor((i + 1) * size), Math.floor(i * size) + 1));
    const best = slice.reduce((top, item) => (item.score > top.score ? item : top), slice[0]);
    if (best) picked.push(queryFrom(best.chunk));
  }
  return [...new Set(picked)].slice(0, limit);
}
