import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, FileText, Inbox, Mail, MessageSquareWarning, PenLine, Plus, Send, TrendingUp } from 'lucide-react';
import { cmsApi, errorMessage } from '../api/client';
import { useAuth } from '../context/useAuth';
import { ROLES } from '../roles';
import { ErrorBanner, Skeleton } from '../components/ui/States';
import StatusBadge from '../components/ui/StatusBadge';
import { ACTION_LABELS, formatNumber, timeAgo } from '../lib/format';

function Stat({ label, value, icon, to, tone = 'text-primaryGreen bg-primaryGreen/10' }) {
  const Icon = icon;
  const body = (
    <div className="admin-card p-4 h-full flex items-center gap-3 transition-colors hover:border-primaryGreen/40">
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums leading-none">{value ?? <Skeleton className="h-6 w-10" />}</p>
        <p className="text-xs text-muted mt-1 truncate">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function ViewAll({ to, children }) {
  return (
    <Link to={to} className="text-xs text-primaryGreen font-medium inline-flex items-center gap-1">
      {children} <ArrowRight className="w-3 h-3" />
    </Link>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="admin-card">
      <div className="flex items-center justify-between px-5 h-12 border-b border-theme">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    cmsApi
      .stats()
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);
  useEffect(load, [load]);

  const c = data?.counts;
  const listSkeleton = (
    <div className="space-y-2 p-3">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
    </div>
  );

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Hi, {user.name}</h1>
          <p className="text-sm text-muted mt-0.5">{isAdmin ? 'Here is what is happening on the blog.' : 'Your writing at a glance.'}</p>
        </div>
        <Link to="/admin/posts/new" className="admin-btn-primary">
          <Plus className="w-4 h-4" /> New post
        </Link>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <div className={`grid grid-cols-2 gap-3 mb-6 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        <Stat label="Published" value={c?.published} icon={FileText} to="/admin/posts?status=published" tone="text-emerald-600 bg-emerald-500/10" />
        <Stat label={isAdmin ? 'Waiting for review' : 'In review'} value={c?.review} icon={Send} to={isAdmin ? '/admin/review' : '/admin/posts?status=review'} tone="text-amber-600 bg-amber-500/10" />
        <Stat label="Drafts" value={c?.draft} icon={PenLine} to="/admin/posts?status=draft" tone="text-sky-600 bg-sky-500/10" />
        <Stat label="Total views" value={data ? formatNumber(data.totalViews) : undefined} icon={Eye} />
        {isAdmin && <Stat label="Subscribers" value={data ? formatNumber(data.subscribers ?? 0) : undefined} icon={Mail} to="/admin/subscribers?status=active" tone="text-violet-600 bg-violet-500/10" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title={isAdmin ? 'Needs review' : 'Needs your attention'}
          action={isAdmin ? <ViewAll to="/admin/review">Open queue</ViewAll> : <ViewAll to="/admin/posts?status=changes_requested">View all</ViewAll>}
        >
          {!data ? (
            listSkeleton
          ) : data.needsAttention.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted">
              {isAdmin ? <Inbox className="w-5 h-5" /> : <MessageSquareWarning className="w-5 h-5" />}
              {isAdmin ? 'Nothing waiting. Nice.' : 'No feedback to address.'}
            </div>
          ) : (
            <ul>
              {data.needsAttention.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/posts/${p.id}`} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-soft">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted">
                        {isAdmin && p.by ? `${p.by} · ` : ''}
                        {timeAgo(p.at)}
                      </p>
                    </div>
                    <StatusBadge status={p.status} revisionState={p.revisionState} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Top posts" action={<ViewAll to="/admin/posts?status=published&sort=views">View all</ViewAll>}>
          {!data ? (
            listSkeleton
          ) : data.topPosts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No published posts yet.</p>
          ) : (
            <ol>
              {data.topPosts.map((p, i) => (
                <li key={p.id}>
                  <Link to={`/admin/posts/${p.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-soft">
                    <span className="w-5 text-xs font-semibold text-muted tabular-nums">{i + 1}</span>
                    <span className="flex-1 text-sm truncate">{p.title}</span>
                    <span className="text-xs text-muted inline-flex items-center gap-1 tabular-nums">
                      <TrendingUp className="w-3 h-3" /> {formatNumber(p.views)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <div className="lg:col-span-2">
          <Panel title={isAdmin ? 'Recent activity' : 'Your recent activity'}>
            {!data ? (
              listSkeleton
            ) : data.activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-[color:var(--border-solid)]">
                {data.activity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <p className="min-w-0 truncate">
                      <span className="font-medium">{a.actor}</span> <span className="text-muted">{ACTION_LABELS[a.action] || a.action}</span>{' '}
                      <Link to={`/admin/posts/${a.postId}`} className="hover:text-primaryGreen">{a.title}</Link>
                    </p>
                    <span className="text-xs text-muted whitespace-nowrap">{timeAgo(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
