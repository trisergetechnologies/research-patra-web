import { useCallback, useEffect, useRef, useState } from 'react';
import { cmsApi } from '../../api/client';

const EMPTY = { comments: [], previous: null, round: 0 };

/** Review thread for one post: comments plus the version the reviewer saw last time. */
export function useReview(postId) {
  const [data, setData] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const run = useRef(0);

  const reload = useCallback(async () => {
    if (!postId) return;
    const id = ++run.current;
    try {
      const d = await cmsApi.getReview(postId);
      if (id === run.current) setData({ comments: d.comments, previous: d.previous, round: d.round });
    } catch {
      // The editor stays usable without the thread.
    } finally {
      if (id === run.current) setLoaded(true);
    }
  }, [postId]);

  useEffect(() => {
    setData(EMPTY);
    setLoaded(false);
    reload();
  }, [reload]);

  const put = useCallback((c) => {
    setData((d) => ({
      ...d,
      comments: d.comments.some((x) => x.id === c.id) ? d.comments.map((x) => (x.id === c.id ? c : x)) : [...d.comments, c],
    }));
    return c;
  }, []);

  const add = useCallback(async (body) => put((await cmsApi.addComment(postId, body)).comment), [postId, put]);

  const update = useCallback(
    async (cid, patch) => {
      setData((d) => ({ ...d, comments: d.comments.map((c) => (c.id === cid ? { ...c, ...patch } : c)) }));
      try {
        return put((await cmsApi.updateComment(postId, cid, patch)).comment);
      } catch (err) {
        reload();
        throw err;
      }
    },
    [postId, put, reload]
  );

  const remove = useCallback(
    async (cid) => {
      await cmsApi.deleteComment(postId, cid);
      setData((d) => ({ ...d, comments: d.comments.filter((c) => c.id !== cid) }));
    },
    [postId]
  );

  const reply = useCallback(async (cid, body) => put((await cmsApi.replyComment(postId, cid, body)).comment), [postId, put]);

  return { ...data, loaded, reload, add, update, remove, reply };
}
