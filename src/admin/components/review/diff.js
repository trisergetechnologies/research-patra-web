import { diffArrays, diffWordsWithSpace } from 'diff';

const HEADING = /^H[1-6]$/;

/** Splits article HTML into comparable blocks: paragraphs, headings, list items, quotes, notes, code, images, table rows. */
export function toBlocks(html) {
  const root = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html').body;
  const blocks = [];
  const add = (type, text, extra = {}) => {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t || type === 'img' || type === 'hr') blocks.push({ type, text: t, key: `${type}|${extra.src ?? t}`, ...extra });
  };
  const walk = (el, inherited) => {
    for (const node of el.children) {
      const tag = node.tagName;
      if (tag === 'UL' || tag === 'OL') walk(node, 'li');
      else if (tag === 'LI') {
        if (node.querySelector('ul,ol')) {
          add('li', [...node.childNodes].filter((n) => !/^(UL|OL)$/.test(n.nodeName)).map((n) => n.textContent).join(' '));
          walk(node, 'li');
        } else add('li', node.textContent);
      } else if (tag === 'BLOCKQUOTE') walk(node, 'quote');
      else if (tag === 'TABLE') node.querySelectorAll('tr').forEach((tr) => add('row', [...tr.children].map((c) => c.textContent.trim()).join('  ·  ')));
      else if (tag === 'IMG') add('img', node.getAttribute('alt') || '', { src: node.getAttribute('src') });
      else if (tag === 'FIGURE' || tag === 'DIV') walk(node, inherited);
      else if (tag === 'HR') add('hr', '');
      else if (tag === 'PRE') add('pre', node.textContent);
      else if (tag === 'ASIDE') add('note', node.textContent);
      else if (tag === 'CITE') add('cite', node.textContent);
      else if (HEADING.test(tag)) add(tag.toLowerCase(), node.textContent);
      else add(inherited || 'p', node.textContent);
    }
  };
  walk(root, null);
  return blocks;
}

const words = (s) => s.toLowerCase().split(/\s+/).filter(Boolean);
function similarity(a, b) {
  const wa = words(a);
  const wb = new Set(words(b));
  if (!wa.length || !wb.size) return 0;
  const shared = wa.filter((w) => wb.has(w)).length;
  return (2 * shared) / (wa.length + wb.size);
}

/** Word-level diff of two strings as [{ value, added, removed }]. */
export const wordDiff = (a, b) => diffWordsWithSpace(a || '', b || '');

/**
 * Rows for the changes view: { kind: 'same' | 'added' | 'removed' | 'changed', blocks, parts? }.
 * A removed block followed by a similar added block becomes one 'changed' row with an inline word diff.
 */
export function diffBlocks(beforeHtml, afterHtml) {
  const parts = diffArrays(toBlocks(beforeHtml), toBlocks(afterHtml), { comparator: (a, b) => a.key === b.key });
  const rows = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p.added && !p.removed) {
      rows.push({ kind: 'same', blocks: p.value });
      continue;
    }
    if (p.removed && parts[i + 1]?.added) {
      const removed = p.value;
      const added = parts[i + 1].value;
      i++;
      const n = Math.max(removed.length, added.length);
      for (let j = 0; j < n; j++) {
        const a = removed[j];
        const b = added[j];
        if (a && b && a.type === b.type && a.type !== 'img' && similarity(a.text, b.text) >= 0.35) {
          rows.push({ kind: 'changed', blocks: [b], parts: wordDiff(a.text, b.text) });
        } else {
          if (a) rows.push({ kind: 'removed', blocks: [a] });
          if (b) rows.push({ kind: 'added', blocks: [b] });
        }
      }
      continue;
    }
    rows.push({ kind: p.added ? 'added' : 'removed', blocks: p.value });
  }
  // Merge neighbouring rows of the same kind so a run of new paragraphs reads as one change.
  return rows.reduce((out, r) => {
    const last = out[out.length - 1];
    if (last && last.kind === r.kind && r.kind !== 'changed') last.blocks = [...last.blocks, ...r.blocks];
    else out.push({ ...r });
    return out;
  }, []);
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Changes outside the article body, as short human labels plus detail for text fields. */
export function fieldChanges(before, after) {
  const out = [];
  if ((before.title || '') !== (after.title || '')) out.push({ key: 'title', label: 'Title', parts: wordDiff(before.title, after.title) });
  if ((before.excerpt || '') !== (after.excerpt || '')) out.push({ key: 'excerpt', label: 'Excerpt', parts: wordDiff(before.excerpt, after.excerpt) });
  if (!same(before.keyTakeaways || [], after.keyTakeaways || [])) {
    const b = new Set(before.keyTakeaways || []);
    const a = new Set(after.keyTakeaways || []);
    out.push({
      key: 'keyTakeaways',
      label: 'Key takeaways',
      added: [...a].filter((t) => !b.has(t)),
      removed: [...b].filter((t) => !a.has(t)),
    });
  }
  if ((before.category?.id || null) !== (after.category?.id || null)) {
    out.push({ key: 'category', label: 'Category', from: before.category?.name || 'None', to: after.category?.name || 'None' });
  }
  const bt = new Map((before.tags || []).map((t) => [t.id, t.name]));
  const at = new Map((after.tags || []).map((t) => [t.id, t.name]));
  const tagsAdded = [...at].filter(([id]) => !bt.has(id)).map(([, n]) => n);
  const tagsRemoved = [...bt].filter(([id]) => !at.has(id)).map(([, n]) => n);
  if (tagsAdded.length || tagsRemoved.length) out.push({ key: 'tags', label: 'Tags', added: tagsAdded, removed: tagsRemoved });
  if ((before.coverImage?.id || null) !== (after.coverImage?.id || null)) {
    out.push({ key: 'coverImage', label: after.coverImage ? (before.coverImage ? 'Cover replaced' : 'Cover added') : 'Cover removed', from: before.coverImage?.thumbUrl, to: after.coverImage?.thumbUrl });
  }
  if ((before.ogImage?.id || null) !== (after.ogImage?.id || null)) out.push({ key: 'ogImage', label: 'Share image changed' });
  if (!same(before.seo || {}, after.seo || {})) out.push({ key: 'seo', label: 'SEO settings changed' });
  return out;
}
