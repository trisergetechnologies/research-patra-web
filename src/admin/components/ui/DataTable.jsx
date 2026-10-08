import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { EmptyState, Skeleton } from './States';

/**
 * columns: [{ key, header, render(row), className, sortKey }]
 * sort: current sort key; onSort(key) when a sortable header is clicked.
 * On small screens rows collapse to cards using `mobile(row)` when provided.
 */
export default function DataTable({ columns, rows, loading, empty, sort, onSort, onRowClick, mobile, rowKey = (r) => r.id }) {
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="bg-surface border border-theme rounded-xl overflow-hidden">
      {mobile && (
        <div className="md:hidden divide-y divide-[color:var(--border-solid)]">
          {loading
            ? skeletonRows.map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            : rows.length === 0
              ? empty
              : rows.map((r) => (
                  <div
                    key={rowKey(r)}
                    className={`p-4 ${onRowClick ? 'cursor-pointer active:bg-soft' : ''}`}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                  >
                    {mobile(r)}
                  </div>
                ))}
        </div>
      )}

      <div className={`${mobile ? 'hidden md:block' : ''} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted border-b border-theme bg-soft/50">
            <tr>
              {columns.map((c) => {
                const active = sort === c.sortKey;
                return (
                  <th key={c.key} className={`px-4 py-3 font-medium whitespace-nowrap ${c.className || ''}`}>
                    {c.sortKey && onSort ? (
                      <button type="button" onClick={() => onSort(c.sortKey)} className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-body ${active ? 'text-body' : ''}`}>
                        {c.header}
                        {active && (c.sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              skeletonRows.map((_, i) => (
                <tr key={i} className="border-b border-theme last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full max-w-[12rem]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty || <EmptyState title="Nothing here yet" />}</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={rowKey(r)}
                  className={`border-b border-theme last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-soft/60' : ''}`}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ''}`}>
                      {c.render ? c.render(r) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
