import React, { useId } from 'react';
import { Info } from 'lucide-react';

/** Small (i) that explains a field on hover or keyboard focus, keeping the page itself free of help text. */
export default function InfoTip({ children, side = 'top', className = '' }) {
  const id = useId();
  const pos =
    side === 'bottom'
      ? 'top-full mt-2 left-1/2 -translate-x-1/2'
      : side === 'right'
        ? 'left-full ml-2 top-1/2 -translate-y-1/2'
        : 'bottom-full mb-2 left-1/2 -translate-x-1/2';
  return (
    <span className={`relative inline-flex group align-middle ${className}`}>
      <button
        type="button"
        aria-describedby={id}
        className="text-muted hover:text-body focus:text-body focus:outline-none rounded-full"
        onClick={(e) => e.preventDefault()}
      >
        <Info className="w-3.5 h-3.5" aria-label="More info" />
      </button>
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute z-50 w-60 rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-lg opacity-0 invisible transition-opacity duration-150 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible dark:bg-gray-700 ${pos}`}
      >
        {children}
      </span>
    </span>
  );
}
