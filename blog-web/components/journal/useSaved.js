'use client';

import { useCallback, useSyncExternalStore } from 'react';

const SAVED_KEY = 'rp-saved';
const EVENT = 'rp-saved-change';

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch {
    return [];
  }
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// "Save for later" kept in localStorage until reader accounts exist. Every button for the same post stays in sync.
export function useSaved(slug) {
  const saved = useSyncExternalStore(subscribe, () => readSaved().includes(slug), () => false);

  const toggle = useCallback(() => {
    const list = readSaved();
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new Event(EVENT));
  }, [slug]);

  return [saved, toggle];
}
