import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

/** Debounced search input. Press "/" anywhere to focus it, Esc to clear. */
export default function SearchBar({ value, onChange, placeholder = 'Search', delay = 300, className = '' }) {
  const [text, setText] = useState(value ?? '');
  const [synced, setSynced] = useState(value ?? '');
  const ref = useRef(null);
  const latest = useRef(onChange);

  // Outside changes (back button, "clear filters") replace what is typed.
  if ((value ?? '') !== synced) {
    setSynced(value ?? '');
    setText(value ?? '');
  }

  useEffect(() => {
    latest.current = onChange;
  });

  useEffect(() => {
    if (text === synced) return undefined;
    const t = setTimeout(() => latest.current(text), delay);
    return () => clearTimeout(t);
  }, [text, synced, delay]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const clear = () => {
    setText('');
    latest.current('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        ref={ref}
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && clear()}
        placeholder={placeholder}
        aria-label={placeholder}
        className="admin-input pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {text ? (
        <button type="button" onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-body" aria-label="Clear search">
          <X className="w-4 h-4" />
        </button>
      ) : (
        <kbd className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-theme px-1.5 text-[10px] text-muted">/</kbd>
      )}
    </div>
  );
}
