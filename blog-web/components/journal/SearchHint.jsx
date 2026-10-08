'use client';

export const OPEN_SEARCH_EVENT = 'rp:open-search';

/** Keyboard hint inside the search box; clicking it opens the instant-search palette. */
export default function SearchHint() {
  return (
    <button
      type="button"
      className="j-kbd-hint"
      aria-label="Open instant search (Ctrl+K)"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
    >
      <kbd>Ctrl</kbd>
      <kbd>K</kbd>
    </button>
  );
}
