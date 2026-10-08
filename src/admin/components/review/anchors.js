// Review comments point at text, not positions: the quoted passage plus a little context on each side.
// That survives edits elsewhere in the document; if the passage itself is rewritten the comment shows as outdated.

const CONTEXT = 32;
const MAX_QUOTE = 1000;

/** Flattens a ProseMirror doc to plain text. `map[i]` is the doc position of `text[i]`, or -1 for a block break. */
export function docText(doc) {
  const parts = [];
  const map = [];
  let length = 0;
  const push = (s, pos) => {
    parts.push(s);
    for (let i = 0; i < s.length; i++) map.push(pos < 0 ? -1 : pos + i);
    length += s.length;
  };
  doc.descendants((node, pos) => {
    if (node.isText) push(node.text, pos);
    else if ((node.isBlock || node.type.name === 'hardBreak') && length && parts[parts.length - 1] !== '\n') push('\n', -1);
    return true;
  });
  return { text: parts.join(''), map };
}

const commonSuffix = (a, b) => {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++;
  return n;
};
const commonPrefix = (a, b) => {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
};

/** Best occurrence of the quote in `text`, ranked by how much surrounding context still matches. */
export function locate(text, { quote, prefix = '', suffix = '' }) {
  if (!quote) return null;
  let best = null;
  let bestScore = -1;
  for (let i = text.indexOf(quote); i !== -1; i = text.indexOf(quote, i + 1)) {
    const end = i + quote.length;
    const score = commonSuffix(text.slice(Math.max(0, i - prefix.length), i), prefix) + commonPrefix(text.slice(end, end + suffix.length), suffix);
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return best === null ? null : { start: best, end: best + quote.length };
}

/** Quote + context for the [start, end) slice of `text`, with surrounding whitespace trimmed off the quote. */
export function anchorAt(text, start, end) {
  while (start < end && /\s/.test(text[start])) start++;
  while (end > start && /\s/.test(text[end - 1])) end--;
  if (end <= start) return null;
  end = Math.min(end, start + MAX_QUOTE);
  return {
    quote: text.slice(start, end),
    prefix: text.slice(Math.max(0, start - CONTEXT), start),
    suffix: text.slice(end, end + CONTEXT),
  };
}

/** Anchor for the editor's current selection, or null when nothing (or only whitespace) is selected. */
export function anchorFromSelection(state) {
  const { from, to, empty } = state.selection;
  if (empty) return null;
  const { text, map } = docText(state.doc);
  let start = -1;
  let end = -1;
  for (let i = 0; i < map.length; i++) {
    const p = map[i];
    if (p < 0) continue;
    if (start < 0 && p >= from) start = i;
    if (p < to) end = i + 1;
  }
  if (start < 0 || end <= start) return null;
  return anchorAt(text, start, end);
}

/** Doc range [from, to) of an anchor, or null when the passage is gone. */
export function rangeInDoc(doc, anchor, flat = docText(doc)) {
  const hit = locate(flat.text, anchor);
  if (!hit) return null;
  const from = flat.map[hit.start];
  const to = flat.map[hit.end - 1] + 1;
  return from >= 0 && to > from ? { from, to } : null;
}
