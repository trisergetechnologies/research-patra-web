import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/** Footer for useInfiniteList: loads the next page when scrolled into view, with a button as fallback. */
export default function LoadMore({ list, total, noun = 'items' }) {
  const ref = useRef(null);
  const { hasMore, loadMore, loadingMore, loading, error, items } = list;

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || error) return undefined;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore, error]);

  if (loading || items.length === 0) return null;
  return (
    <div ref={ref} className="flex items-center justify-between gap-3 pt-4 text-sm text-muted">
      <span className="tabular-nums">
        {total != null ? `${items.length} of ${total}` : items.length} {noun}
      </span>
      {hasMore && (
        <button type="button" className="admin-btn-ghost" onClick={loadMore} disabled={loadingMore}>
          {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
          {loadingMore ? 'Loading…' : error ? 'Try again' : 'Load more'}
        </button>
      )}
    </div>
  );
}
