import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, GitPullRequestArrow, Inbox } from 'lucide-react';
import { cmsApi } from '../api/client';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useInfiniteList } from '../hooks/useInfiniteList';
import SearchBar from '../components/ui/SearchBar';
import LoadMore from '../components/ui/LoadMore';
import InfoTip from '../components/ui/InfoTip';
import { EmptyState, ErrorBanner, PageHeader, Skeleton } from '../components/ui/States';
import { timeAgo } from '../lib/format';

const DEFAULTS = { q: '' };
const LIMIT = 20;

export default function ReviewQueue() {
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const list = useInfiniteList(
    (cursor) => cmsApi.listPosts({ ...filters, status: 'review', sort: 'submitted', limit: LIMIT, cursor }),
    (d) => d.posts,
    JSON.stringify(filters)
  );
  const { loading } = list;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Review queue"
        info={<InfoTip side="bottom">New posts and edits to live posts submitted by staff, oldest first. Open one to publish it or send feedback.</InfoTip>}
      />
      <SearchBar value={filters.q} onChange={(q) => setFilters({ q })} placeholder="Search submissions" className="mb-4 sm:max-w-sm" />
      <ErrorBanner message={list.items.length ? '' : list.error} onRetry={list.reload} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : list.items.length === 0 ? (
        <div className="admin-card">
          <EmptyState icon={Inbox} title={filters.q ? 'No submissions match your search' : 'All caught up. Nothing to review.'} />
        </div>
      ) : (
        <ul className="space-y-3">
          {list.items.map((p) => {
            const isEdit = p.revisionState === 'in_review';
            return (
              <li key={p.id}>
                <Link to={`/admin/posts/${p.id}`} className="admin-card flex items-center gap-4 p-4 transition-colors hover:border-primaryGreen/40">
                  {p.coverThumb ? (
                    <img src={p.coverThumb} alt="" className="hidden sm:block w-24 h-14 rounded-lg object-cover bg-soft shrink-0" />
                  ) : (
                    <span className="hidden sm:block w-24 h-14 rounded-lg bg-soft shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${isEdit ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                        {isEdit && <GitPullRequestArrow className="w-3 h-3" />}
                        {isEdit ? 'Edit to live post' : 'New post'}
                      </span>
                      {p.category && <span className="text-xs text-muted truncate">{p.category.name}</span>}
                    </div>
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted mt-0.5 inline-flex items-center gap-1">
                      {p.createdBy?.name || p.author?.displayName} · <Clock className="w-3 h-3" /> {timeAgo(p.submittedAt || p.updatedAt)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <LoadMore list={list} total={list.meta?.total} noun="submissions" />
    </div>
  );
}
