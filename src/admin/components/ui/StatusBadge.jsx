import React from 'react';

const STATUS_META = {
  draft: { label: 'Draft', cls: 'bg-gray-500/10 text-gray-600 dark:text-gray-300', dot: 'bg-gray-400' },
  in_review: { label: 'In review', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  changes_requested: { label: 'Changes requested', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
  published: { label: 'Published', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  archived: { label: 'Archived', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  deleted: { label: 'Deleted', cls: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-500' },
};

const REVISION_LABEL = { draft: 'Edits in progress', in_review: 'Edits in review', changes_requested: 'Edits need changes' };

export default function StatusBadge({ status, revisionState, deleted, className = '' }) {
  const meta = STATUS_META[deleted ? 'deleted' : status] || STATUS_META.draft;
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
      {revisionState && !deleted && (
        <span
          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
            revisionState === 'in_review' ? STATUS_META.in_review.cls : revisionState === 'changes_requested' ? STATUS_META.changes_requested.cls : 'bg-sky-500/10 text-sky-700 dark:text-sky-400'
          }`}
        >
          {REVISION_LABEL[revisionState]}
        </span>
      )}
    </span>
  );
}
