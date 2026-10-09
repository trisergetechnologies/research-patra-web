import React from 'react';
import { Mail } from 'lucide-react';
import { adminApi } from '../api/client';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { useUrlFilters } from '../hooks/useUrlFilters';
import DataTable from '../components/ui/DataTable';
import LoadMore from '../components/ui/LoadMore';
import SearchBar from '../components/ui/SearchBar';
import FilterChips from '../components/ui/FilterChips';
import InfoTip from '../components/ui/InfoTip';
import { EmptyState, ErrorBanner, PageHeader } from '../components/ui/States';
import { formatDate } from '../lib/format';

const LIMIT = 30;
const DEFAULTS = { q: '', status: '' };

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  active: { label: 'Subscribed', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  unsubscribed: { label: 'Unsubscribed', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
};

function StatusPill({ status }) {
  const meta = STATUS[status] || STATUS.pending;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}>{meta.label}</span>;
}

export default function Subscribers() {
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const list = useInfiniteList(
    (cursor) => adminApi.listSubscribers({ ...filters, limit: LIMIT, cursor }),
    (d) => d.subscribers,
    JSON.stringify(filters)
  );
  const counts = list.meta?.counts;
  const chips = [
    { value: '', label: 'All', count: counts?.all },
    { value: 'active', label: 'Subscribed', count: counts?.active },
    { value: 'pending', label: 'Pending', count: counts?.pending },
    { value: 'unsubscribed', label: 'Unsubscribed', count: counts?.unsubscribed },
  ];

  const columns = [
    { key: 'email', header: 'Email', render: (s) => <span className="font-medium">{s.email}</span> },
    { key: 'status', header: 'Status', render: (s) => <StatusPill status={s.status} /> },
    { key: 'source', header: 'Source', className: 'hidden sm:table-cell', render: (s) => <span className="text-muted">{s.source || '—'}</span> },
    { key: 'joined', header: 'Joined', className: 'hidden md:table-cell', render: (s) => <span className="text-muted">{formatDate(s.createdAt)}</span> },
    { key: 'confirmed', header: 'Confirmed', className: 'hidden lg:table-cell', render: (s) => <span className="text-muted">{formatDate(s.confirmedAt)}</span> },
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Subscribers"
        info={<InfoTip side="bottom">People who asked for the journal newsletter. Pending means they have not confirmed the email yet.</InfoTip>}
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <SearchBar value={filters.q} onChange={(q) => setFilters({ q })} placeholder="Search email" className="sm:max-w-xs sm:flex-1" />
        <FilterChips options={chips} value={filters.status} onChange={(status) => setFilters({ status })} />
      </div>
      <ErrorBanner message={list.items.length ? '' : list.error} onRetry={list.reload} />
      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        empty={<EmptyState icon={Mail} title={filters.q || filters.status ? 'No subscribers match' : 'No subscribers yet'} />}
        mobile={(s) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">{s.email}</p>
              <p className="text-xs text-muted mt-0.5">Joined {formatDate(s.createdAt)}</p>
            </div>
            <StatusPill status={s.status} />
          </div>
        )}
      />
      <LoadMore list={list} total={list.meta?.total} noun="subscribers" />
    </div>
  );
}
