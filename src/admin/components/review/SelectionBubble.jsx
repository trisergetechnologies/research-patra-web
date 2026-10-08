import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditorState } from '@tiptap/react';
import { MessageSquarePlus } from 'lucide-react';
import { anchorFromSelection } from './anchors';

/** Small "Comment" button floating above a text selection in the article. */
export default function SelectionBubble({ editor, onComment }) {
  const sel = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? { from: e.state.selection.from, to: e.state.selection.to, empty: e.state.selection.empty } : null),
  });
  const [, setTick] = useState(0);

  useEffect(() => {
    const reflow = () => setTick((t) => t + 1);
    window.addEventListener('scroll', reflow, true);
    window.addEventListener('resize', reflow);
    document.addEventListener('selectionchange', reflow);
    return () => {
      window.removeEventListener('scroll', reflow, true);
      window.removeEventListener('resize', reflow);
      document.removeEventListener('selectionchange', reflow);
    };
  }, []);

  if (!editor || !sel || sel.empty || sel.to - sel.from < 2) return null;
  // The editor keeps its last selection after focus moves elsewhere; only show while the page selection is really in the article.
  const domSel = window.getSelection();
  if (!domSel || domSel.isCollapsed || !editor.view.dom.contains(domSel.anchorNode)) return null;
  let start;
  let end;
  try {
    start = editor.view.coordsAtPos(sel.from);
    end = editor.view.coordsAtPos(sel.to);
  } catch {
    return null;
  }
  const box = editor.view.dom.getBoundingClientRect();
  if (start.top < box.top - 4 || start.top > window.innerHeight) return null;
  const left = start.top === end.top ? (start.left + end.left) / 2 : start.left + 24;

  const comment = () => {
    const anchor = anchorFromSelection(editor.state);
    if (anchor) onComment(anchor);
  };

  return createPortal(
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={comment}
      style={{ top: Math.max(8, start.top - 42), left: Math.min(Math.max(8, left), window.innerWidth - 120) }}
      className="fixed z-50 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-black/5 animate-[fadeIn_.12s_ease-out] hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
    >
      <MessageSquarePlus className="w-3.5 h-3.5" /> Comment
    </button>,
    document.body
  );
}
