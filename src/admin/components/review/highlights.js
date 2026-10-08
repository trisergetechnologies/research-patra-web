import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { docText, rangeInDoc } from './anchors';

export const highlightKey = new PluginKey('reviewHighlights');

function build(doc, anchors, activeId) {
  const flat = docText(doc);
  const ranges = new Map();
  const decorations = [];
  for (const a of anchors) {
    const r = rangeInDoc(doc, a, flat);
    if (!r) continue;
    ranges.set(a.id, r);
    const cls = ['rp-hl', `is-${a.kind}`, a.status && `is-${a.status}`, a.id === activeId && 'is-active'].filter(Boolean).join(' ');
    decorations.push(Decoration.inline(r.from, r.to, { class: cls, 'data-cid': a.id }));
  }
  return { set: DecorationSet.create(doc, decorations), ranges };
}

/**
 * Paints review comments onto the editor. Feed it with `setHighlights(editor, anchors, activeId)`;
 * clicks on a highlight call `editor.storage.reviewHighlights.onClick(id)`.
 */
export const ReviewHighlights = Extension.create({
  name: 'reviewHighlights',
  addStorage: () => ({ anchors: [], activeId: null, onClick: null }),
  addProseMirrorPlugins() {
    const storage = this.storage;
    return [
      new Plugin({
        key: highlightKey,
        state: {
          init: (_, state) => build(state.doc, storage.anchors, storage.activeId),
          apply: (tr, old, _prev, state) =>
            tr.docChanged || tr.getMeta(highlightKey) ? build(state.doc, storage.anchors, storage.activeId) : old,
        },
        props: {
          decorations: (state) => highlightKey.getState(state).set,
          handleClick: (_view, _pos, event) => {
            const id = event.target.closest?.('[data-cid]')?.dataset.cid;
            if (id) storage.onClick?.(id);
            return false;
          },
        },
      }),
    ];
  },
});

export function setHighlights(editor, anchors, activeId) {
  if (!editor || editor.isDestroyed) return;
  Object.assign(editor.storage.reviewHighlights, { anchors, activeId });
  editor.view.dispatch(editor.state.tr.setMeta(highlightKey, true).setMeta('addToHistory', false));
}

export function onHighlightClick(editor, fn) {
  if (editor && !editor.isDestroyed) editor.storage.reviewHighlights.onClick = fn;
}

const NONE = new Map();

/** Where each highlighted comment currently sits in the doc. */
export const highlightRanges = (editor) => (editor && !editor.isDestroyed ? highlightKey.getState(editor.state)?.ranges : null) ?? NONE;
