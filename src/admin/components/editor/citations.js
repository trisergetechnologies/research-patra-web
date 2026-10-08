// Citations are plain "[n]" markers in the text plus a numbered list under a "References"/"Sources" heading.
// The blog turns each marker into a linked superscript with a hover preview of the source.
export const REF_HEADING = /^\s*(references|sources|bibliography|works cited)\s*$/i;

function findReferenceList(doc) {
  let underHeading = false;
  let found = null;
  doc.forEach((node, offset) => {
    if (found) return;
    if (node.type.name === 'heading') underHeading = REF_HEADING.test(node.textContent);
    else if (underHeading && node.type.name === 'orderedList') found = { pos: offset, node };
  });
  return found;
}

const item = (text) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

/** Inserts the next "[n]" at the cursor and adds the source to the References list (created at the end if missing). */
export function insertCitation(editor, source) {
  const list = findReferenceList(editor.state.doc);
  const n = (list?.node.childCount ?? 0) + 1;
  const marker = `[${n}]`;

  editor.chain().focus().insertContent(marker).run();
  const caret = editor.state.selection.to;

  const after = findReferenceList(editor.state.doc);
  if (after) {
    editor.commands.insertContentAt(after.pos + after.node.nodeSize - 1, item(source));
  } else {
    editor.commands.insertContentAt(editor.state.doc.content.size, [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'References' }] },
      { type: 'orderedList', content: [item(source)] },
    ]);
  }
  editor.chain().focus().setTextSelection(caret).run();
}
