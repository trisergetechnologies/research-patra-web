'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getProgress, subscribeProgress } from '@/lib/readingProgress';

/** "40% read" / "Read" marker on a post card, from this browser's reading history. Renders nothing on the server. */
export default function CardProgress({ slug }) {
  const get = useCallback(() => getProgress(slug), [slug]);
  const p = useSyncExternalStore(subscribeProgress, get, () => null);
  if (p === null || p < 0.05) return null;
  const done = p >= 0.9;
  return (
    <span className={`j-cardprog ${done ? 'j-done' : ''}`} aria-label={done ? 'You have read this' : `${Math.round(p * 100)}% read`}>
      <i style={{ width: `${Math.round((done ? 1 : p) * 100)}%` }} />
      <em>{done ? '✓ Read' : `${Math.round(p * 100)}% read`}</em>
    </span>
  );
}
