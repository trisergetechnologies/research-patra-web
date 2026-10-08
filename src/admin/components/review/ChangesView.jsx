import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, FileDiff } from 'lucide-react';
import { diffBlocks, fieldChanges } from './diff';
import { timeAgo } from '../../lib/format';

const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

function Words({ parts }) {
  return parts.map((p, i) =>
    p.added ? (
      <ins key={i} className="rp-ins">{p.value}</ins>
    ) : p.removed ? (
      <del key={i} className="rp-del">{p.value}</del>
    ) : (
      <span key={i}>{p.value}</span>
    )
  );
}

function Block({ b, children }) {
  const body = children ?? b.text;
  switch (b.type) {
    case 'h1':
    case 'h2':
      return <h2>{body}</h2>;
    case 'h3':
      return <h3>{body}</h3>;
    case 'h4':
    case 'h5':
    case 'h6':
      return <h4>{body}</h4>;
    case 'li':
      return (
        <ul>
          <li>{body}</li>
        </ul>
      );
    case 'quote':
      return (
        <blockquote>
          <p>{body}</p>
        </blockquote>
      );
    case 'note':
      return <aside className="j-note">{body}</aside>;
    case 'pre':
      return (
        <pre>
          <code>{body}</code>
        </pre>
      );
    case 'img':
      return b.src ? <img src={b.src} alt={b.text} className="max-h-56" /> : <p className="text-muted">[image]</p>;
    case 'hr':
      return <hr />;
    case 'row':
      return <p className="font-mono text-[13px]">{body}</p>;
    case 'cite':
      return <p className="text-xs uppercase tracking-wider text-muted">{body}</p>;
    default:
      return <p>{body}</p>;
  }
}

const ROW_STYLE = {
  added: 'border-emerald-500/70 bg-emerald-500/[0.06]',
  removed: 'border-rose-500/70 bg-rose-500/[0.05] [&_*]:line-through [&_*]:decoration-rose-500/50 text-muted',
  changed: 'border-amber-400/80',
};
const ROW_LABEL = { added: 'Added', removed: 'Removed', changed: 'Edited' };

function Unchanged({ blocks }) {
  const [open, setOpen] = useState(false);
  if (blocks.length <= 2 || open) {
    return (
      <div className="rp-prose opacity-60">
        {blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-3 py-1 text-xs text-muted hover:text-body">
      <span className="h-px flex-1 bg-[color:var(--border-solid)]" />
      <ChevronsUpDown className="w-3.5 h-3.5" /> {blocks.length} unchanged blocks
      <span className="h-px flex-1 bg-[color:var(--border-solid)]" />
    </button>
  );
}

function FieldChange({ f }) {
  if (f.parts) {
    return (
      <div>
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted">{f.label}</dt>
        <dd className={`mt-0.5 ${f.key === 'title' ? 'text-lg font-semibold leading-snug' : 'text-sm'}`}>
          <Words parts={f.parts} />
        </dd>
      </div>
    );
  }
  if (f.added || f.removed) {
    return (
      <div>
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted">{f.label}</dt>
        <dd className="mt-1 flex flex-wrap gap-1.5 text-xs">
          {f.added.map((t) => (
            <span key={`+${t}`} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">+ {t}</span>
          ))}
          {f.removed.map((t) => (
            <span key={`-${t}`} className="rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-700 line-through dark:text-rose-300">{t}</span>
          ))}
        </dd>
      </div>
    );
  }
  if (f.key === 'coverImage') {
    return (
      <div>
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted">{f.label}</dt>
        <dd className="mt-1 flex items-center gap-2">
          {f.from && <img src={f.from} alt="Previous cover" className="h-12 w-20 rounded object-cover opacity-60" />}
          {f.from && f.to && <span className="text-muted">→</span>}
          {f.to && <img src={f.to} alt="New cover" className="h-12 w-20 rounded object-cover" />}
        </dd>
      </div>
    );
  }
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted">{f.label}</dt>
      {f.from !== undefined && (
        <dd className="mt-0.5 text-sm">
          <span className="text-muted line-through">{f.from}</span> → {f.to}
        </dd>
      )}
    </div>
  );
}

/**
 * What changed between a baseline (last reviewed version, or the live post) and what is on screen now.
 * Unchanged runs collapse; J / K or the arrows step through changes.
 */
export default function ChangesView({ current, baselines, onReview }) {
  const [baseId, setBaseId] = useState(baselines[0]?.id ?? null);
  const base = baselines.find((b) => b.id === baseId) ?? baselines[0];
  const [at, setAt] = useState(-1);
  const refs = useRef([]);

  const { rows, fields } = useMemo(
    () => (base ? { rows: diffBlocks(base.content.contentHtml, current.contentHtml), fields: fieldChanges(base.content, current) } : { rows: [], fields: [] }),
    [base, current]
  );
  const changeRows = rows.filter((r) => r.kind !== 'same');
  const total = changeRows.length + (fields.length ? 1 : 0);

  const go = (dir) => {
    if (!total) return;
    const next = at < 0 ? (dir > 0 ? 0 : total - 1) : (at + dir + total) % total;
    setAt(next);
    refs.current[next]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement)) return;
      const k = e.key.toLowerCase();
      if (k === 'j' || k === 'k') {
        e.preventDefault();
        goRef.current(k === 'j' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!base) {
    return (
      <div className="admin-card px-6 py-14 text-center">
        <FileDiff className="mx-auto w-6 h-6 text-muted" />
        <p className="mt-3 font-medium">First version</p>
        <p className="mt-1 text-sm text-muted">There is nothing earlier to compare with. Read the whole post instead.</p>
        <button type="button" className="admin-btn-secondary mt-4" onClick={onReview}>Read the post</button>
      </div>
    );
  }

  let n = fields.length ? 1 : 0;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {baselines.length > 1 ? (
          <div className="inline-flex rounded-lg border border-theme bg-surface p-0.5 text-xs font-medium">
            {baselines.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => (setBaseId(b.id), setAt(-1))}
                className={`rounded-md px-3 py-1.5 ${b.id === base.id ? 'bg-soft text-body' : 'text-muted hover:text-body'}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sm font-medium">{base.label}</span>
        )}
        {base.at && <span className="text-xs text-muted">from {timeAgo(base.at)}</span>}
        <span className="flex-1" />
        <span className="text-xs text-muted">{total ? `${at >= 0 ? `${at + 1} of ` : ''}${total} change${total === 1 ? '' : 's'}` : 'No changes'}</span>
        <div className="flex">
          <button type="button" className="admin-btn-ghost p-1.5" onClick={() => go(-1)} disabled={!total} aria-label="Previous change (K)" title="Previous change (K)">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button type="button" className="admin-btn-ghost p-1.5" onClick={() => go(1)} disabled={!total} aria-label="Next change (J)" title="Next change (J)">
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!total ? (
        <div className="admin-card px-6 py-14 text-center">
          <p className="font-medium">Nothing changed</p>
          <p className="mt-1 text-sm text-muted">This version matches {base.id === 'live' ? 'the live post' : 'the one you last reviewed'}.</p>
        </div>
      ) : (
        <>
          {fields.length > 0 && (
            <dl
              ref={(el) => (refs.current[0] = el)}
              className={`admin-card space-y-3 p-4 transition-shadow ${at === 0 ? 'ring-2 ring-primaryGreen/30' : ''}`}
            >
              {fields.map((f) => (
                <FieldChange key={f.key} f={f} />
              ))}
            </dl>
          )}
          <div className="admin-card space-y-3 px-5 py-4">
            {rows.map((r, i) => {
              if (r.kind === 'same') return <Unchanged key={i} blocks={r.blocks} />;
              const idx = n++;
              return (
                <div
                  key={i}
                  ref={(el) => (refs.current[idx] = el)}
                  className={`relative -mx-5 border-l-[3px] px-5 py-2 transition-shadow ${ROW_STYLE[r.kind]} ${at === idx ? 'ring-2 ring-inset ring-primaryGreen/30' : ''}`}
                >
                  <span className="absolute right-3 top-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{ROW_LABEL[r.kind]}</span>
                  <div className="rp-prose pr-14">
                    {r.kind === 'changed' ? (
                      <Block b={r.blocks[0]}>
                        <Words parts={r.parts} />
                      </Block>
                    ) : (
                      r.blocks.map((b, j) => <Block key={j} b={b} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
