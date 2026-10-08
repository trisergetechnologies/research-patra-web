import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, CornerDownLeft, Loader2, MessageSquarePlus, MoreHorizontal, Pencil, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { errorMessage } from '../../api/client';
import { useToast } from '../ui/toastContext';
import { timeAgo } from '../../lib/format';

const FIELD_LABEL = { title: 'Title', excerpt: 'Excerpt', general: 'General' };
const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

function Avatar({ user }) {
  const admin = user?.role === 'admin';
  return (
    <span
      className={`grid place-items-center w-6 h-6 shrink-0 rounded-full text-[11px] font-semibold ${admin ? 'bg-primaryGreen/15 text-primaryGreen' : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'}`}
      aria-hidden
    >
      {(user?.name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

function KindChip({ kind, onToggle }) {
  const must = kind === 'must';
  const cls = `rounded-full px-2 py-0.5 text-[11px] font-medium ${must ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'}`;
  if (!onToggle) return <span className={cls}>{must ? 'Must fix' : 'Suggestion'}</span>;
  return (
    <div className="inline-flex rounded-full bg-soft p-0.5 text-[11px] font-medium" role="radiogroup" aria-label="Comment type">
      {[
        ['must', 'Must fix'],
        ['suggestion', 'Suggestion'],
      ].map(([k, label]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={kind === k}
          onClick={() => onToggle(k)}
          className={`rounded-full px-2.5 py-1 transition-colors ${kind === k ? (k === 'must' ? 'bg-surface text-rose-700 shadow-sm dark:text-rose-300' : 'bg-surface text-sky-700 shadow-sm dark:text-sky-300') : 'text-muted hover:text-body'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Quote({ text, outdated, onClick }) {
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full text-left border-l-2 pl-2.5 text-xs leading-5 line-clamp-2 ${outdated ? 'border-theme text-muted line-through' : 'border-amber-400/70 text-muted hover:text-body'}`}
      title={outdated ? 'This text has changed since the comment' : 'Show in article'}
    >
      {text}
    </button>
  );
}

/** Shared box for new and edited comments. Enter saves, Shift+Enter adds a line, Esc cancels. */
function Composer({ quote, initial, submitLabel, onSubmit, onCancel }) {
  const [body, setBody] = useState(initial?.body ?? '');
  const [kind, setKind] = useState(initial?.kind ?? 'must');
  const [suggest, setSuggest] = useState(initial?.suggestion != null);
  const [suggestion, setSuggestion] = useState(initial?.suggestion ?? quote ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit({ body: body.trim(), kind, suggestion: suggest ? suggestion : null });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };
  const keys = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-2.5" onKeyDown={keys}>
      <textarea
        autoFocus
        rows={2}
        value={body}
        maxLength={2000}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What should change?"
        className="admin-input resize-none text-sm"
      />
      {suggest ? (
        <div>
          <span className="text-[11px] font-medium text-muted">Replace with</span>
          <textarea rows={2} value={suggestion} maxLength={2000} onChange={(e) => setSuggestion(e.target.value)} className="admin-input mt-1 resize-none text-sm" />
        </div>
      ) : (
        quote !== undefined && (
          <button type="button" onClick={() => setSuggest(true)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-body">
            <Sparkles className="w-3.5 h-3.5" /> Suggest new wording
          </button>
        )
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <KindChip kind={kind} onToggle={setKind} />
        <span className="flex-1" />
        <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="admin-btn-primary px-3 py-1.5 text-xs" disabled={!body.trim() || busy} onClick={submit}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CornerDownLeft className="w-3.5 h-3.5" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function ReplyBox({ onSubmit, onCancel }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      await onSubmit(body.trim());
      setBody('');
      onCancel();
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-end gap-2">
      <textarea
        autoFocus
        rows={1}
        value={body}
        maxLength={2000}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
          else if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Reply…"
        className="admin-input resize-none py-1.5 text-sm"
      />
      <button type="button" className="admin-btn-secondary px-2.5 py-1.5" disabled={!body.trim() || busy} onClick={submit} aria-label="Send reply">
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CornerDownLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function CommentCard({ c, me, outdated, active, perms, actions }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [menu, setMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [active]);

  const mine = c.author?.id === me?.id;
  const draft = c.status === 'draft';
  const resolved = c.status === 'resolved';
  const run = (p) => p.catch((err) => toast.error(errorMessage(err)));

  if (resolved && !active && !expanded) {
    return (
      <li ref={ref}>
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            actions.activate(c.id);
          }}
          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-soft"
        >
          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate flex-1">{c.quote || c.body}</span>
          <span className="shrink-0">{c.resolvedBy?.name?.split(' ')[0]}</span>
        </button>
      </li>
    );
  }

  return (
    <li
      ref={ref}
      data-comment={c.id}
      onClick={(e) => !e.target.closest('button, textarea, a') && actions.activate(c.id, true)}
      className={`group rounded-xl border bg-surface p-3 transition-[border-color,box-shadow] duration-150 ${
        active ? 'border-primaryGreen/50 shadow-[0_0_0_3px_rgba(234,88,12,0.08)]' : 'border-theme hover:border-[color:var(--border-solid)]'
      } ${resolved ? 'opacity-75' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Avatar user={c.author} />
        <span className="text-sm font-medium truncate">{c.author?.name || 'Reviewer'}</span>
        <span className="text-xs text-muted shrink-0">{timeAgo(c.createdAt)}</span>
        <span className="flex-1" />
        {draft && <span className="rounded-full border border-dashed border-theme px-2 py-0.5 text-[11px] text-muted">Not sent</span>}
        {resolved ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Resolved
          </span>
        ) : (
          <KindChip kind={c.kind} />
        )}
        {mine && !editing && (
          <div className="relative">
            <button type="button" className="admin-btn-ghost p-1" aria-label="Comment options" onClick={() => setMenu((m) => !m)}>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menu && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-theme bg-surface py-1 shadow-lg z-20" onMouseLeave={() => setMenu(false)}>
                <button type="button" className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-soft" onClick={() => (setMenu(false), setEditing(true))}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button type="button" className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-soft dark:text-red-400" onClick={() => (setMenu(false), run(actions.remove(c.id)))}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 space-y-2 pl-8">
        {c.field !== 'contentHtml' && <span className="text-[11px] font-medium uppercase tracking-wider text-muted">{FIELD_LABEL[c.field]}</span>}
        <Quote text={c.field === 'general' ? '' : c.quote} outdated={outdated} onClick={() => actions.activate(c.id, true)} />
        {outdated && <p className="text-[11px] text-muted">The quoted text has changed.</p>}

        {editing ? (
          <Composer
            quote={c.field === 'general' ? undefined : c.quote}
            initial={c}
            submitLabel="Save"
            onCancel={() => setEditing(false)}
            onSubmit={async (patch) => {
              await actions.update(c.id, patch);
              setEditing(false);
            }}
          />
        ) : (
          <>
            <p className="text-sm whitespace-pre-line break-words">{c.body}</p>
            {c.suggestion != null && (
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-2">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Suggested wording</p>
                <p className="mt-0.5 text-sm whitespace-pre-line break-words">{c.suggestion || <em className="text-muted">Remove this text</em>}</p>
                {perms.accept && !resolved && !outdated && (
                  <button type="button" className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700" onClick={() => actions.accept(c)}>
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {c.replies.length > 0 && (
          <ul className="space-y-2 border-t border-theme pt-2">
            {c.replies.map((r) => (
              <li key={r.id} className="flex gap-2">
                <Avatar user={r.author} />
                <div className="min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{r.author?.name}</span> <span className="text-muted">{timeAgo(r.at)}</span>
                  </p>
                  <p className="text-sm whitespace-pre-line break-words">{r.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {resolved && c.resolvedBy && (
          <p className="text-[11px] text-muted">
            Resolved by {c.resolvedBy.name} · {timeAgo(c.resolvedAt)}
          </p>
        )}

        {!draft && !editing && (replying ? (
          <ReplyBox onCancel={() => setReplying(false)} onSubmit={(body) => run(actions.reply(c.id, body))} />
        ) : (
          <div className="flex items-center gap-1 -ml-2">
            <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={() => setReplying(true)}>
              Reply
            </button>
            <span className="flex-1" />
            {perms.resolve &&
              (resolved ? (
                <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={() => run(actions.update(c.id, { status: 'open' }))}>
                  <RotateCcw className="w-3.5 h-3.5" /> Reopen
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-theme px-2.5 py-1 text-xs font-medium hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
                  onClick={() => run(actions.update(c.id, { status: 'resolved' }))}
                >
                  <Check className="w-3.5 h-3.5" /> Resolve
                </button>
              ))}
          </div>
        ))}
      </div>
    </li>
  );
}

/**
 * Right-hand column of the review: new-comment box, open comments in reading order, then resolved ones.
 * J / K move between comments when focus is not in a text field.
 */
export default function CommentRail({ comments, outdated, me, pending, canComment, perms, active, actions, onCancelPending, onCreate, onGeneral }) {
  const [showResolved, setShowResolved] = useState(false);
  const open = comments.filter((c) => c.status !== 'resolved');
  const resolved = comments.filter((c) => c.status === 'resolved');

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement)) return;
      const k = e.key.toLowerCase();
      if (k !== 'j' && k !== 'k') return;
      const list = showResolved ? [...open, ...resolved] : open;
      if (!list.length) return;
      e.preventDefault();
      const i = list.findIndex((c) => c.id === active);
      const next = k === 'j' ? (i + 1) % list.length : (i <= 0 ? list.length : i) - 1;
      actions.activate(list[next].id, true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, resolved, showResolved, active, actions]);

  const card = (c) => <CommentCard key={c.id} c={c} me={me} outdated={outdated.has(c.id)} active={active === c.id} perms={perms} actions={actions} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">Comments</h2>
        {comments.length > 0 && (
          <span className="text-xs text-muted">
            {open.length} open{resolved.length ? ` · ${resolved.length} resolved` : ''}
          </span>
        )}
        <span className="flex-1" />
        {canComment && !pending && (
          <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={onGeneral}>
            <MessageSquarePlus className="w-3.5 h-3.5" /> General
          </button>
        )}
      </div>

      {pending && (
        <div className="rounded-xl border border-primaryGreen/40 bg-surface p-3 shadow-sm animate-[fadeIn_.15s_ease-out]">
          {pending.field !== 'contentHtml' && <span className="text-[11px] font-medium uppercase tracking-wider text-muted">{FIELD_LABEL[pending.field]}</span>}
          {pending.quote && <p className="mb-2.5 border-l-2 border-primaryGreen/60 pl-2.5 text-xs leading-5 text-muted line-clamp-3">{pending.quote}</p>}
          <Composer
            key={`${pending.field}:${pending.quote}`}
            quote={pending.field === 'general' ? undefined : pending.quote}
            submitLabel="Comment"
            onCancel={onCancelPending}
            onSubmit={(data) => onCreate({ ...pending, ...data })}
          />
        </div>
      )}

      {comments.length === 0 && !pending ? (
        <div className="rounded-xl border border-dashed border-theme px-4 py-8 text-center">
          <MessageSquarePlus className="mx-auto w-5 h-5 text-muted" />
          <p className="mt-2 text-sm font-medium">No comments yet</p>
          <p className="mt-1 text-xs text-muted">{canComment ? 'Select any text in the article to comment on it.' : 'Feedback from the reviewer shows up here.'}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">{open.map(card)}</ul>
      )}

      {resolved.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowResolved((s) => !s)} className="flex w-full items-center gap-1.5 py-1 text-xs font-medium text-muted hover:text-body">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showResolved ? '' : '-rotate-90'}`} />
            Resolved ({resolved.length})
          </button>
          {showResolved && <ul className="mt-1 space-y-1">{resolved.map(card)}</ul>}
        </div>
      )}

      {open.length + resolved.length > 1 && (
        <p className="pt-1 text-center text-[11px] text-muted">
          <kbd className="rounded border border-theme px-1">J</kbd> / <kbd className="rounded border border-theme px-1">K</kbd> to move between comments
        </p>
      )}
    </div>
  );
}
