'use client';

import { useState } from 'react';
import { PostCard } from './PostBits';
import { BASE_PATH } from '@/lib/site';

/**
 * The listing grid with "Load more". Server-rendered cards come in as children; further pages are fetched
 * from the blog's own cached /api/posts route and appended. Numbered page links stay for crawlers until
 * the reader starts loading more.
 */
export default function PostGrid({ children, initialSlugs, page, totalPages, query, pager }) {
  const [extra, setExtra] = useState([]);
  const [loaded, setLoaded] = useState(page);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadMore = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const params = new URLSearchParams(Object.entries({ ...query, page: loaded + 1 }).filter(([, v]) => v != null && v !== ''));
      const res = await fetch(`${BASE_PATH}/api/posts?${params}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setExtra((prev) => {
        const seen = new Set([...initialSlugs, ...prev.map((p) => p.slug)]);
        return [...prev, ...data.items.filter((p) => !seen.has(p.slug))];
      });
      setLoaded(data.page);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="j-grid">
        {children}
        {extra.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
      {loaded < totalPages && (
        <div className="j-more">
          <button type="button" className="j-btn j-ghost" onClick={loadMore} disabled={busy}>
            {busy ? 'Loading…' : failed ? 'Try again' : 'Load more articles'}
          </button>
          {failed && <span role="status">Could not load more articles.</span>}
        </div>
      )}
      {extra.length === 0 && pager}
    </>
  );
}
