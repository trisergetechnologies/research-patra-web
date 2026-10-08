import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { errorMessage } from '../../api/client';
import { anchorAt, locate } from './anchors';
import { highlightRanges, onHighlightClick, setHighlights } from './highlights';
import { useReview } from './useReview';

const FIELD_ORDER = { title: 0, excerpt: 1, contentHtml: 2, general: 3 };
export const FIELD_IDS = { title: 'post-title', excerpt: 'excerpt' };

/**
 * Everything the editor page needs for review: the thread, where each comment sits,
 * the new-comment draft, and actions (create, resolve, accept a suggestion with undo).
 */
export function useReviewWorkspace({ postId, editor, form, set, toast }) {
  const review = useReview(postId);
  const [active, setActive] = useState(null);
  const [pending, setPending] = useState(null);

  const ranges = useEditorState({ editor, selector: ({ editor: e }) => highlightRanges(e), equalityFn: (a, b) => a === b });

  const outdated = useMemo(() => {
    const out = new Set();
    for (const c of review.comments) {
      if (c.status === 'resolved') continue;
      if (c.field === 'contentHtml' && editor && !ranges?.has(c.id)) out.add(c.id);
      if ((c.field === 'title' || c.field === 'excerpt') && c.quote && !locate(form[c.field] || '', c)) out.add(c.id);
    }
    return out;
  }, [review.comments, ranges, editor, form]);

  // Reading order: title, excerpt, article top to bottom (moved-away text last), then general notes.
  const comments = useMemo(() => {
    const key = (c) => FIELD_ORDER[c.field] + (c.field === 'contentHtml' ? (ranges?.get(c.id)?.from ?? 1e7) / 1e8 : 0);
    return [...review.comments].sort((a, b) => key(a) - key(b));
  }, [review.comments, ranges]);

  const anchors = useMemo(() => {
    const list = review.comments
      .filter((c) => c.field === 'contentHtml' && (c.status !== 'resolved' || c.id === active))
      .map((c) => ({ id: c.id, quote: c.quote, prefix: c.prefix, suffix: c.suffix, kind: c.kind, status: c.status }));
    if (pending?.field === 'contentHtml') list.push({ ...pending, id: 'pending', kind: 'must', status: 'pending' });
    return list;
  }, [review.comments, pending, active]);

  useEffect(() => {
    setHighlights(editor, anchors, active);
  }, [editor, anchors, active]);

  const activate = useCallback(
    (id, scroll = false) => {
      setActive(id);
      if (!scroll) return;
      const c = review.comments.find((x) => x.id === id);
      if (!c) return;
      if (c.field === 'contentHtml') {
        const r = highlightRanges(editor).get(id);
        if (!r) return;
        const { node } = editor.view.domAtPos(r.from);
        (node.nodeType === 1 ? node : node.parentElement)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } else if (FIELD_IDS[c.field]) {
        document.getElementById(FIELD_IDS[c.field])?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    },
    [review.comments, editor]
  );

  useEffect(() => {
    onHighlightClick(editor, (id) => id !== 'pending' && activate(id));
  }, [editor, activate]);

  /** Comment on the title or excerpt: the selected words if any, else the whole field. */
  const startFieldComment = useCallback(
    (field) => {
      if (field === 'general') return setPending({ field, quote: '', prefix: '', suffix: '' });
      const el = document.getElementById(FIELD_IDS[field]);
      const value = form[field] || '';
      const hasSel = el && el.selectionEnd > el.selectionStart;
      const anchor = anchorAt(value, hasSel ? el.selectionStart : 0, hasSel ? el.selectionEnd : value.length);
      setPending({ field, ...(anchor || { quote: '', prefix: '', suffix: '' }) });
    },
    [form]
  );

  const startTextComment = useCallback((anchor) => {
    setPending({ field: 'contentHtml', ...anchor });
    window.getSelection()?.removeAllRanges();
  }, []);

  const create = useCallback(
    async (data) => {
      const c = await review.add(data);
      setPending(null);
      setActive(c.id);
    },
    [review]
  );

  const resolve = useCallback((id, status) => review.update(id, { status }), [review]);

  const accept = useCallback(
    async (c) => {
      const text = c.suggestion ?? '';
      let undo;
      if (c.field === 'contentHtml') {
        const r = highlightRanges(editor).get(c.id);
        if (!r) return toast.error('The quoted text has changed, so the suggestion cannot be applied.');
        const chain = editor.chain().focus();
        (text ? chain.insertContentAt(r, { type: 'text', text }) : chain.deleteRange(r)).run();
        undo = () => editor.commands.undo();
      } else {
        const value = form[c.field] || '';
        const hit = locate(value, c);
        if (!hit) return toast.error('The quoted text has changed, so the suggestion cannot be applied.');
        set({ [c.field]: value.slice(0, hit.start) + text + value.slice(hit.end) });
        undo = () => set({ [c.field]: value });
      }
      try {
        await resolve(c.id, 'resolved');
      } catch (err) {
        toast.error(errorMessage(err));
      }
      toast.success('Suggestion applied', {
        action: {
          label: 'Undo',
          onClick: () => {
            undo();
            resolve(c.id, 'open').catch(() => {});
          },
        },
      });
    },
    [editor, form, set, resolve, toast]
  );

  const sent = review.comments.filter((c) => c.status !== 'draft');
  const counts = {
    drafts: review.comments.length - sent.length,
    sent: sent.length,
    resolved: sent.filter((c) => c.status === 'resolved').length,
    mustLeft: sent.filter((c) => c.status === 'open' && c.kind === 'must').length,
    byField: review.comments.reduce((m, c) => ((m[c.field] = (m[c.field] || 0) + (c.status === 'resolved' ? 0 : 1)), m), {}),
  };

  const actions = useMemo(
    () => ({ activate, accept, update: review.update, remove: review.remove, reply: review.reply }),
    [activate, accept, review.update, review.remove, review.reply]
  );

  return { review, comments, outdated, active, activate, pending, setPending, startFieldComment, startTextComment, create, actions, counts };
}
