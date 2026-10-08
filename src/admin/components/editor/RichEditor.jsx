import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, Node, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Code2, Link2, ImagePlus,
  Table as TableIcon, Undo2, Redo2, StickyNote, Minus, Rows3, Columns3, Trash2, BookMarked,
} from 'lucide-react';
import MediaLibraryModal from '../media/MediaLibraryModal';
import { insertCitation } from './citations';
import { ReviewHighlights } from '../review/highlights';

// Blog callout: <aside class="j-note"><strong>Label</strong> text</aside>
const Note = Node.create({
  name: 'note',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML: () => [{ tag: 'aside.j-note' }],
  renderHTML: () => ['aside', { class: 'j-note' }, 0],
});

// Attribution line inside a blockquote.
const Cite = Node.create({
  name: 'cite',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'cite' }],
  renderHTML: () => ['cite', 0],
});

function Btn({ on, active, disabled, label, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors disabled:opacity-35 ${
        active ? 'bg-primaryGreen/15 text-primaryGreen' : 'text-muted hover:bg-soft hover:text-body'
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="w-px h-5 bg-[color:var(--border-solid)] mx-1" />;

export default function RichEditor({ value, onChange, editable = true, resetKey, placeholder = 'Start writing…', onReady }) {
  const [imageOpen, setImageOpen] = useState(false);
  const changeRef = useRef(onChange);
  const readyRef = useRef(onReady);
  useEffect(() => {
    changeRef.current = onChange;
    readyRef.current = onReady;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, protocols: ['mailto', 'tel'], HTMLAttributes: { rel: 'noopener noreferrer', target: null } },
      }),
      Image.configure({ inline: false }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
      Note,
      Cite,
      ReviewHighlights,
    ],
    content: value || '',
    editable,
    immediatelyRender: true,
    onUpdate: ({ editor: e }) => changeRef.current(e.isEmpty ? '' : e.getHTML()),
    editorProps: { attributes: { class: 'rp-prose focus:outline-none min-h-[420px] px-5 py-4' } },
  });

  // Load new content only when switching documents (or live/revision), never while typing.
  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.commands.setContent(value || '', { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    readyRef.current?.(editor);
    return () => readyRef.current?.(null);
  }, [editor]);

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            strike: e.isActive('strike'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            code: e.isActive('codeBlock'),
            link: e.isActive('link'),
            note: e.isActive('note'),
            table: e.isActive('table'),
            undo: e.can().undo(),
            redo: e.can().redo(),
          }
        : {},
  });

  if (!editor) return null;
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (leave empty to remove)', prev);
    if (url === null) return;
    if (!url.trim()) return c().extendMarkRange('link').unsetLink().run();
    const href = /^(https?:|mailto:|tel:|\/)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    c().extendMarkRange('link').setLink({ href }).run();
  };

  const cite = () => {
    const source = window.prompt('Source to cite (author, year, title, link). It is added to References at the end.');
    if (source?.trim()) insertCitation(editor, source.trim());
  };

  const toggleNote = () => {
    if (s.note) c().setParagraph().run();
    else c().setNode('note').run();
  };

  return (
    <div className="admin-card overflow-hidden">
      {editable && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-theme bg-surface/95 backdrop-blur px-2 py-1.5">
          <Btn label="Heading" active={s.h2} on={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></Btn>
          <Btn label="Subheading" active={s.h3} on={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></Btn>
          <Sep />
          <Btn label="Bold (Ctrl+B)" active={s.bold} on={() => c().toggleBold().run()}><Bold className="w-4 h-4" /></Btn>
          <Btn label="Italic (Ctrl+I)" active={s.italic} on={() => c().toggleItalic().run()}><Italic className="w-4 h-4" /></Btn>
          <Btn label="Underline (Ctrl+U)" active={s.underline} on={() => c().toggleUnderline().run()}><Underline className="w-4 h-4" /></Btn>
          <Btn label="Strikethrough" active={s.strike} on={() => c().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></Btn>
          <Btn label="Link" active={s.link} on={setLink}><Link2 className="w-4 h-4" /></Btn>
          <Btn label="Cite a source" on={cite}><BookMarked className="w-4 h-4" /></Btn>
          <Sep />
          <Btn label="Bulleted list" active={s.bullet} on={() => c().toggleBulletList().run()}><List className="w-4 h-4" /></Btn>
          <Btn label="Numbered list" active={s.ordered} on={() => c().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Btn>
          <Btn label="Quote" active={s.quote} on={() => c().toggleBlockquote().run()}><Quote className="w-4 h-4" /></Btn>
          <Btn label="Callout note" active={s.note} on={toggleNote}><StickyNote className="w-4 h-4" /></Btn>
          <Btn label="Code block" active={s.code} on={() => c().toggleCodeBlock().run()}><Code2 className="w-4 h-4" /></Btn>
          <Btn label="Divider" on={() => c().setHorizontalRule().run()}><Minus className="w-4 h-4" /></Btn>
          <Sep />
          <Btn label="Insert image" on={() => setImageOpen(true)}><ImagePlus className="w-4 h-4" /></Btn>
          <Btn label="Insert table" on={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="w-4 h-4" /></Btn>
          {s.table && (
            <>
              <Btn label="Add row" on={() => c().addRowAfter().run()}><Rows3 className="w-4 h-4" /></Btn>
              <Btn label="Add column" on={() => c().addColumnAfter().run()}><Columns3 className="w-4 h-4" /></Btn>
              <Btn label="Delete table" on={() => c().deleteTable().run()}><Trash2 className="w-4 h-4" /></Btn>
            </>
          )}
          <span className="ml-auto flex">
            <Btn label="Undo (Ctrl+Z)" disabled={!s.undo} on={() => c().undo().run()}><Undo2 className="w-4 h-4" /></Btn>
            <Btn label="Redo (Ctrl+Shift+Z)" disabled={!s.redo} on={() => c().redo().run()}><Redo2 className="w-4 h-4" /></Btn>
          </span>
        </div>
      )}
      <EditorContent editor={editor} />
      <MediaLibraryModal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        slot="inline"
        title="Insert image"
        onSelect={(m) => c().setImage({ src: m.url, alt: m.alt, width: m.displayWidth, height: m.displayHeight }).run()}
      />
    </div>
  );
}
