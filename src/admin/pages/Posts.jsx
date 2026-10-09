import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Star, X } from 'lucide-react';
import { cmsApi } from '../api/client';
import { useAuth } from '../context/useAuth';
import { ROLES } from '../roles';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useInfiniteList } from '../hooks/useInfiniteList';
import SearchBar from '../components/ui/SearchBar';
import FilterChips from '../components/ui/FilterChips';
import DataTable from '../components/ui/DataTable';
import LoadMore from '../components/ui/LoadMore';
import StatusBadge from '../components/ui/StatusBadge';
import InfoTip from '../components/ui/InfoTip';
import { EmptyState, ErrorBanner, PageHeader } from '../components/ui/States';
import { formatNumber, timeAgo } from '../lib/format';

const DEFAULTS = { q: '', status: '', category: '', author: '', sort: 'updated', mine: '' };
const LIMIT = 20;

export default function Posts() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);
  const navigate = useNavigate();
  const [filters, setFilters, { reset, active }] = useUrlFilters(DEFAULTS);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const list = useInfiniteList((cursor) => cmsApi.listPosts({ ...filters, limit: LIMIT, cursor }), (d) => d.posts, JSON.stringify(filters));

  useEffect(() => {
    cmsApi.listCategories().then((d) => setCategories(d.categories)).catch(() => {});
    if (isAdmin) cmsApi.listAuthors().then((d) => setAuthors(d.authors)).catch(() => {});
  }, [isAdmin]);

  const c = list.meta?.counts;
  const statusOptions = [
    { value: '', label: 'All', count: c?.all },
    { value: 'draft', label: 'Drafts', count: c?.draft },
    { value: 'review', label: 'In review', count: c?.review },
    { value: 'changes_requested', label: 'Changes requested', count: c?.changes_requested },
    { value: 'published', label: 'Published', count: c?.published },
    { value: 'archived', label: 'Archived', count: c?.archived },
    ...(isAdmin ? [{ value: 'deleted', label: 'Trash', count: c?.deleted }] : []),
  ];

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortKey: 'title',
      sortDir: 'asc',
      render: (p) => (
        <div className="flex items-center gap-3 min-w-[14rem]">
          {p.coverThumb ? (
            <img src={p.coverThumb} alt="" className="hidden xl:block w-16 h-9 rounded object-cover bg-soft shrink-0" loading="lazy" />
          ) : (
            <span className="hidden xl:flex w-16 h-9 rounded bg-soft shrink-0 items-center justify-center text-muted">
              <FileText className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium line-clamp-2">
              {p.featured && <Star className="inline w-3.5 h-3.5 mr-1 -mt-0.5 fill-amber-400 text-amber-400" aria-label="Featured" />}
              {p.title}
            </p>
            <p className="text-xs text-muted truncate max-w-xs">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} revisionState={p.revisionState} deleted={p.deleted} /> },
    { key: 'category', header: 'Category', className: 'hidden xl:table-cell', render: (p) => <span className="text-muted">{p.category?.name || '—'}</span> },
    { key: 'author', header: 'Author', className: 'hidden lg:table-cell', render: (p) => <span className="text-muted whitespace-nowrap">{p.author?.displayName || '—'}</span> },
    { key: 'updated', header: 'Updated', sortKey: 'updated', render: (p) => <span className="text-muted whitespace-nowrap">{timeAgo(p.updatedAt)}</span> },
    { key: 'views', header: 'Views', sortKey: 'views', className: 'hidden lg:table-cell text-right', render: (p) => <span className="tabular-nums text-muted">{formatNumber(p.views)}</span> },
  ];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Posts"
        info={<InfoTip side="bottom">{isAdmin ? 'Every post on the blog. Click a row to edit, review or publish it.' : 'Posts you have written. Drafts go to an admin for review before they are published.'}</InfoTip>}
        actions={
          <Link to="/admin/posts/new" className="admin-btn-primary">
            <Plus className="w-4 h-4" /> New post
          </Link>
        }
      />

      <div className="space-y-3 mb-4">
        <FilterChips options={statusOptions} value={filters.status} onChange={(status) => setFilters({ status })} />
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:[&>select]:w-44 [&>select]:shrink-0">
          <SearchBar value={filters.q} onChange={(q) => setFilters({ q })} placeholder="Search title, slug or excerpt" className="sm:flex-1 sm:min-w-[16rem]" />
          <select className="admin-input" value={filters.category} onChange={(e) => setFilters({ category: e.target.value })} aria-label="Category">
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {isAdmin && (
            <select className="admin-input" value={filters.author} onChange={(e) => setFilters({ author: e.target.value })} aria-label="Author">
              <option value="">All authors</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a?.displayName}</option>
              ))}
            </select>
          )}
          <select className="admin-input" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })} aria-label="Sort">
            <option value="updated">Recently updated</option>
            <option value="oldest">Oldest updated</option>
            <option value="published">Recently published</option>
            <option value="views">Most viewed</option>
            <option value="title">Title A–Z</option>
          </select>
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
        sort={filters.sort}
        onSort={(sort) => setFilters({ sort })}
        onRowClick={(p) => navigate(`/admin/posts/${p.id}`)}
        mobile={(p) => (
          <div className="space-y-1.5">
            <p className="font-medium leading-snug">{p.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <StatusBadge status={p.status} revisionState={p.revisionState} deleted={p.deleted} />
              <span>{p.author?.displayName}</span>
              <span>· {timeAgo(p.updatedAt)}</span>
            </div>
          </div>
        )}
        empty={
          <EmptyState
            icon={FileText}
            title={active ? 'No posts match these filters' : 'No posts yet'}
            action={
              active ? (
                <button type="button" className="admin-btn-secondary" onClick={reset}>Clear filters</button>
              ) : (
                <Link to="/admin/posts/new" className="admin-btn-primary"><Plus className="w-4 h-4" /> Write the first post</Link>
              )
            }
          />
        }
      />
      <LoadMore list={list} total={list.meta?.total} noun="posts" />
    </div>
  );
}
