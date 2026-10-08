'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OPEN_SEARCH_EVENT } from './SearchHint';

const RECENT_KEY = 'rp-recent-search';
const MIN_QUERY = 2;

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 5);
  } catch {
    return [];
  }
};
const saveRecent = (q) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5)));
  } catch {
    // Storage blocked: recent searches are a nicety.
  }
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Highlight({ text, q }) {
  const words = q.trim().split(/\s+/).filter((w) => w.length >= MIN_QUERY).map(escapeRe);
  if (!words.length) return text;
  const parts = text.split(new RegExp(`(${words.join('|')})`, 'gi'));
  return parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
}

const isTyping = (el) => el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));

/** Ctrl/⌘ K or "/" anywhere on the blog: instant search over published articles. */
export default function SearchPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !isTyping(document.activeElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  return open ? <Palette onClose={() => setOpen(false)} /> : null;
}

function Palette({ onClose }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef(null);
  const [q, setQ] = useState('');
  const [state, setState] = useState({ q: '', items: [], total: 0, loading: false, error: false });
  const [active, setActive] = useState(0);
  const [recent] = useState(readRecent);
  const query = q.trim();
  const searching = query.length >= MIN_QUERY;

  useEffect(() => {
    const prev = document.activeElement;
    inputRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (!searching) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        const res = await fetch(`/api/public/posts?q=${encodeURIComponent(query)}&limit=6`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setState({ q: query, items: data.items || [], total: data.total || 0, loading: false, error: false });
        setActive(0);
      } catch (err) {
        if (err.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error: true }));
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, searching]);

  const items = searching ? state.items : [];
  const options = searching
    ? [...items.map((p) => ({ kind: 'post', post: p })), { kind: 'all' }]
    : recent.map((r) => ({ kind: 'recent', q: r }));

  const go = useCallback(
    (opt) => {
      if (!opt) return;
      if (opt.kind === 'recent') {
        setQ(opt.q);
        return;
      }
      if (query) saveRecent(query);
      onClose();
      router.push(opt.kind === 'post' ? `/${opt.post.slug}` : `/search?q=${encodeURIComponent(query)}`);
    },
    [query, onClose, router]
  );

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!options.length) return;
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(options[active] ?? (searching ? { kind: 'all' } : null));
    }
  };

  const optionId = (i) => `${listId}-o${i}`;

  return (
    <div className="rpj j-palette-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="j-palette" role="dialog" aria-modal="true" aria-label="Search articles">
        <div className="j-palette-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls={listId}
            aria-activedescendant={options.length ? optionId(active) : undefined}
            aria-autocomplete="list"
            placeholder="Search articles, topics, authors…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          {state.loading && searching && <span className="j-spin" aria-hidden="true" />}
          <kbd onClick={onClose}>Esc</kbd>
        </div>

        <ul id={listId} role="listbox" className="j-palette-list" aria-label={searching ? 'Results' : 'Recent searches'}>
          {!searching && recent.length > 0 && <li className="j-palette-h" role="presentation">Recent</li>}
          {options.map((opt, i) => (
            <li
              key={opt.kind === 'post' ? opt.post.slug : opt.kind === 'recent' ? `r-${opt.q}` : 'all'}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'j-on' : undefined}
              onMouseMove={() => setActive(i)}
              onClick={() => go(opt)}
            >
              {opt.kind === 'post' && (
                <>
                  <b><Highlight text={opt.post.title} q={state.q} /></b>
                  <small>
                    {opt.post.category?.name} · {opt.post.readingTime} min read
                  </small>
                </>
              )}
              {opt.kind === 'recent' && <span className="j-palette-recent">↺ {opt.q}</span>}
              {opt.kind === 'all' && (
                <span className="j-palette-all">
                  {state.total > items.length ? `See all ${state.total} results` : 'Open full search'} for “{query}” →
                </span>
              )}
            </li>
          ))}
        </ul>

        {searching && !state.loading && state.q === query && !items.length && !state.error && (
          <p className="j-palette-empty">No articles match “{query}”. Try a broader word, like “thesis” or “SPSS”.</p>
        )}
        {state.error && <p className="j-palette-empty">Search is unavailable right now. Press Enter to use full search.</p>}
        {!searching && !recent.length && <p className="j-palette-empty">Type at least two letters to search every article.</p>}

        <div className="j-palette-foot" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
          <span><kbd>Enter</kbd> to open</span>
          <span><kbd>Ctrl</kbd><kbd>K</kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
}
