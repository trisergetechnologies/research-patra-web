// How far a reader got in each article, kept in localStorage so cards can show "40% read" and articles can offer to resume.
const KEY = 'rp-progress';
const MAX_ENTRIES = 100;
const EVENT = 'rp-progress';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

/** Fraction 0..1 read for `slug`, or null. */
export function getProgress(slug) {
  const v = readAll()[slug]?.p;
  return typeof v === 'number' ? v : null;
}

export function setProgress(slug, p) {
  const all = readAll();
  all[slug] = { p: Math.round(p * 100) / 100, at: Date.now() };
  const keys = Object.keys(all);
  if (keys.length > MAX_ENTRIES) {
    keys.sort((a, b) => all[a].at - all[b].at).slice(0, keys.length - MAX_ENTRIES).forEach((k) => delete all[k]);
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage full or blocked: progress is a nicety.
  }
}

export function subscribeProgress(cb) {
  const onStorage = (e) => (e.key === null || e.key === KEY) && cb();
  window.addEventListener('storage', onStorage);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EVENT, cb);
  };
}
