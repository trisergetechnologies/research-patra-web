import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, X } from 'lucide-react';
import { cmsApi } from '../api/client';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useInfiniteList } from '../hooks/useInfiniteList';
import SearchBar from '../components/ui/SearchBar';
import FilterChips from '../components/ui/FilterChips';
import DataTable from '../components/ui/DataTable';
import LoadMore from '../components/ui/LoadMore';
import InfoTip from '../components/ui/InfoTip';
import { EmptyState, ErrorBanner, PageHeader } from '../components/ui/States';
import { timeAgo } from '../lib/format';
import { overlapPercent, plagiarismDot, plagiarismLabel, plagiarismTone } from '../lib/plagiarism';

const DEFAULTS = { q: '', status: '' };
const LIMIT = 20;

const percent = (value) => (value == null ? '—' : overlapPercent(value));

export default function PlagiarismList() {
  const navigate = useNavigate();
  const [filters, setFilters, { reset, active }] = useUrlFilters(DEFAULTS);
  const list = useInfiniteList(
    (cursor) => cmsApi.listPlagiarism({ ...filters, limit: LIMIT, cursor }),
    (data) => data.checks,
    JSON.stringify(filters)
  );
  const itemsRef = useRef(list.items);
  const { setItems } = list;

  useEffect(() => {
    itemsRef.current = list.items;
    const live = () => itemsRef.current.some((row) => row.status === 'queued' || row.status === 'running');
    if (!live()) return undefined;
    const timer = setInterval(() => {
      if (!live()) return;
      cmsApi
        .listPlagiarism({ q: filters.q, limit: 50 })
        .then((data) => {
          const byId = new Map((data.checks || []).map((row) => [row.id, row]));
          setItems((prev) => prev.flatMap((row) => {
            const next = byId.get(row.id) || row;
            if ((filters.status === 'queued' || filters.status === 'running') && next.status !== filters.status) return [];
            return [next];
          }));
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [list.items, setItems, filters.q, filters.status]);

  const c = list.meta?.counts;
  const statusOptions = [
    { value: '', label: 'All', count: c?.all },
    { value: 'queued', label: 'Queued', count: c?.queued },
    { value: 'running', label: 'Checking', count: c?.running },
    { value: 'clear', label: 'Clear', count: c?.clear },
    { value: 'review', label: 'Review', count: c?.review },
    { value: 'strong', label: 'Strong overlap', count: c?.strong },
    { value: 'incomplete', label: 'Incomplete', count: c?.incomplete },
  ];

  const result = (row) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${plagiarismTone(row)}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${plagiarismDot(row)} ${row.status === 'running' ? 'animate-pulse' : ''}`} />
      {plagiarismLabel(row)}
    </span>
  );

  const columns = [
    { key: 'title', header: 'Article', render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'result', header: 'Result', render: result },
    { key: 'internal', header: 'On this site', className: 'hidden sm:table-cell', render: (row) => <span className="tabular-nums text-muted">{percent(row.internal)}</span> },
    { key: 'web', header: 'Web', className: 'hidden md:table-cell', render: (row) => <span className="tabular-nums text-muted">{percent(row.web)}</span> },
    { key: 'when', header: 'When', render: (row) => <span className="text-muted whitespace-nowrap">{timeAgo(row.at)}</span> },
  ];

  const quota = list.meta?.quota;

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Plagiarism"
        info={<InfoTip side="bottom">Every plagiarism check, including ones still running. Open a finished check to download it.</InfoTip>}
      >
        {quota && (
          <p className="mt-1 text-sm text-muted">
            {quota.used} of {quota.limit} checks this month
            {quota.remaining <= 0 ? ` · Resets ${quota.resetMonth}` : ''}
          </p>
        )}
      </PageHeader>

      <div className="space-y-3 mb-4">
        <FilterChips options={statusOptions} value={filters.status} onChange={(status) => setFilters({ status })} />
        <div className="flex flex-col sm:flex-row gap-2">
          <SearchBar value={filters.q} onChange={(q) => setFilters({ q })} placeholder="Search articles" className="sm:flex-1 sm:min-w-[16rem]" />
          {active && (
            <button type="button" className="admin-btn-ghost shrink-0" onClick={reset}>
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={list.items.length ? '' : list.error} onRetry={list.reload} />

      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        onRowClick={(row) => navigate(`/admin/plagiarism/${row.id}`)}
        mobile={(row) => (
          <div className="space-y-1.5">
            <p className="font-medium leading-snug">{row.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              {result(row)}
              <span>· {timeAgo(row.at)}</span>
            </div>
          </div>
        )}
        empty={
          <EmptyState
            icon={FileSearch}
            title={active ? 'No checks match' : 'No plagiarism checks yet'}
            action={active ? <button type="button" className="admin-btn-secondary" onClick={reset}>Clear filters</button> : null}
          />
        }
      />
      <LoadMore list={list} total={list.meta?.total} noun="checks" />
    </div>
  );
}
