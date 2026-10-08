import React from 'react';

/** Single-select pill group with optional counts. options: [{ value, label, count? }] */
export default function FilterChips({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1.5 overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] ${className}`} role="tablist">
      {options.map((o) => {
        const active = (value ?? '') === o.value;
        return (
          <button
            key={o.value || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              active
                ? 'bg-primaryGreen text-white border-primaryGreen'
                : 'bg-surface text-muted border-theme hover:text-body hover:bg-soft'
            }`}
          >
            {o.label}
            {o.count != null && (
              <span className={`rounded-full px-1.5 text-[10px] leading-4 ${active ? 'bg-white/25' : 'bg-soft text-muted'}`}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
