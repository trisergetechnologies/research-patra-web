import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/client';

/**
 * Cursor-paged list that grows as the user scrolls.
 * fetchPage(cursor) -> API response with `nextCursor`; pick(response) -> rows.
 * `key` (e.g. JSON of the filters) restarts the list from the first page when it changes.
 * `meta` holds the first page's response (totals, counts) for headers and chips.
 */
export function useInfiniteList(fetchPage, pick, key) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const run = useRef(0);
  const fetchRef = useRef(fetchPage);
  const pickRef = useRef(pick);
  fetchRef.current = fetchPage;
  pickRef.current = pick;

  const reload = useCallback(async () => {
    const id = ++run.current;
    setLoading(true);
    setLoadingMore(false);
    setError('');
    try {
      const data = await fetchRef.current(undefined);
      if (id !== run.current) return;
      setItems(pickRef.current(data));
      setMeta(data);
      setCursor(data.nextCursor ?? null);
    } catch (err) {
      if (id !== run.current) return;
      setItems([]);
      setCursor(null);
      setError(errorMessage(err));
    } finally {
      if (id === run.current) setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loading || loadingMore) return;
    const id = run.current;
    setLoadingMore(true);
    setError('');
    try {
      const data = await fetchRef.current(cursor);
      if (id !== run.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        return [...prev, ...pickRef.current(data).filter((r) => !seen.has(r.id))];
      });
      setCursor(data.nextCursor ?? null);
    } catch (err) {
      if (id === run.current) setError(errorMessage(err));
    } finally {
      if (id === run.current) setLoadingMore(false);
    }
  }, [cursor, loading, loadingMore]);

  useEffect(() => {
    reload();
  }, [key, reload]);

  return { items, setItems, meta, loading, loadingMore, error, hasMore: !!cursor, loadMore, reload };
}
