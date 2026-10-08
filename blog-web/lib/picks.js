import { useMemo, useSyncExternalStore } from 'react';

/*
 * Per-visitor variety without breaking caching: the server sends a cached pool (best matches first),
 * and each browser picks from it with a seed it keeps. Same visitor, same picks; different visitors, different picks.
 * The server render (and first paint) shows the top of the pool, so crawlers always see the most relevant items.
 */

const SEED_KEY = 'rpj-seed';
let memorySeed = null;

function readSeed() {
  try {
    let seed = localStorage.getItem(SEED_KEY);
    if (!seed) {
      seed = String(crypto.getRandomValues(new Uint32Array(1))[0]);
      localStorage.setItem(SEED_KEY, seed);
    }
    return seed;
  } catch {
    memorySeed ??= String(Math.floor(Math.random() * 2 ** 32));
    return memorySeed;
  }
}

const noopSubscribe = () => () => {};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `count` items from `items`, chosen by `seed`, kept in the pool's original order. */
export function pickFrom(items, count, seed) {
  if (items.length <= count) return items;
  const next = rng(hash(seed));
  const idx = items.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, count).sort((a, b) => a - b).map((i) => items[i]);
}

/** Client hook: top `count` on the server and during hydration, the visitor's own picks after that. */
export function useVisitorPicks(items, count, key = '') {
  const seed = useSyncExternalStore(noopSubscribe, readSeed, () => null);
  return useMemo(() => (seed ? pickFrom(items, count, `${seed}:${key}`) : items.slice(0, count)), [items, count, key, seed]);
}
