import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cmsApi, errorMessage } from '../api/client';
import { useToast } from '../components/ui/toastContext';
import { ErrorBanner, PageHeader, Skeleton } from '../components/ui/States';
import { overlapPercent, plagiarismLabel, plagiarismTone, startsScan, verdictSentence } from '../lib/plagiarism';

function Figure({ label, value, hint }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Source({ source }) {
  const kind = source.kind === 'web' ? 'Web' : 'On this site';
  return (
    <details className="group border-b border-theme">
      <summary className="flex cursor-pointer list-none items-baseline gap-3 py-3 text-sm [&::-webkit-details-marker]:hidden">
        <span className="w-12 shrink-0 font-medium tabular-nums">{overlapPercent(source.overlap)}</span>
        <span className="min-w-0 flex-1 truncate">{source.title}</span>
        <span className="shrink-0 text-xs text-muted">{source.exact ? 'Exact copy' : kind}</span>
      </summary>
      <div className="space-y-3 pb-4 pl-0 sm:pl-12">
        {source.passages?.length ? (
          source.passages.map((passage) => (
            <blockquote key={`${passage.startWord}-${passage.endWord}`} className="border-l-2 border-amber-400/80 pl-3">
              <p className="text-sm leading-relaxed">
                <mark className="rounded bg-amber-200/80 px-0.5 text-inherit dark:bg-amber-400/20">{passage.excerpt}</mark>
              </p>
              <p className="mt-1 text-xs text-muted">
                {passage.words} words
                {passage.nearCopy ? ' · Near copy' : ''}
                {passage.quotation ? ' · Quotation' : ''}
              </p>
            </blockquote>
          ))
        ) : (
          <p className="text-sm text-muted">Overlap is spread through the article, with no single long passage.</p>
        )}
        {source.kind === 'web' && source.url && (
          <a href={source.url} target="_blank" rel="noreferrer" className="inline-block text-xs font-medium text-primaryGreen hover:underline">
            Open source
          </a>
        )}
        {source.kind !== 'web' && source.postId && (
          <Link to={`/admin/posts/${source.postId}`} className="inline-block text-xs font-medium text-primaryGreen hover:underline">
            Open article
          </Link>
        )}
      </div>
    </details>
  );
}

export default function PlagiarismReport() {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loadedId, setLoadedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const loading = loadedId !== id;

  const load = useCallback(() => {
    return cmsApi
      .getPlagiarism(id)
      .then((next) => {
        setData(next);
        setError('');
        setLoadedId(id);
      })
      .catch((err) => {
        setError(errorMessage(err));
        setLoadedId(id);
      });
  }, [id]);

  useEffect(() => {
    let cancel = false;
    cmsApi
      .getPlagiarism(id)
      .then((next) => {
        if (cancel) return;
        setData(next);
        setError('');
        setLoadedId(id);
      })
      .catch((err) => {
        if (cancel) return;
        setError(errorMessage(err));
        setLoadedId(id);
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  const status = data?.summary?.status;
  useEffect(() => {
    if (status !== 'queued' && status !== 'running') return undefined;
    const timer = setInterval(() => load(), 4000);
    return () => clearInterval(timer);
  }, [status, load]);

  const start = () => {
    setBusy(true);
    cmsApi
      .startPlagiarism(id)
      .then((next) => setData(next))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setBusy(false));
  };

  const summary = data?.summary;
  const report = data?.report;
  const waiting = status === 'queued' || status === 'running';
  const verdict = summary?.status === 'complete' ? summary.verdict : summary?.status === 'incomplete' || summary?.status === 'failed' ? 'incomplete' : report?.verdict;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Plagiarism"
        actions={
          <Link to={`/admin/posts/${id}`} className="text-sm text-muted hover:underline">
            Back to article
          </Link>
        }
      />
      <ErrorBanner message={error} onRetry={load} />
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-24" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          <p className={`text-sm font-medium ${plagiarismTone(summary)}`}>{plagiarismLabel(summary)}</p>

          {summary?.stale && (
            <p className="text-sm text-muted">
              The article changed after this check.{' '}
              <button type="button" className="font-medium text-primaryGreen hover:underline" disabled={busy} onClick={start}>
                {busy ? 'Sending…' : 'Check again'}
              </button>
            </p>
          )}

          {startsScan(summary) && (
            <p className="text-sm text-muted">
              Nothing has been checked yet.{' '}
              <button type="button" className="font-medium text-primaryGreen hover:underline" disabled={busy} onClick={start}>
                {busy ? 'Sending…' : 'Check plagiarism'}
              </button>
            </p>
          )}

          {waiting && (
            <p className="text-sm text-muted">
              {status === 'queued' ? 'Waiting in the queue.' : 'Comparing published articles, submissions in review, and a limited set of web pages.'} You can publish whenever you are ready.
            </p>
          )}

          {(summary?.status === 'incomplete' || summary?.status === 'failed' || verdict === 'incomplete') && !waiting && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              {report?.failureReason || verdictSentence('incomplete')}
            </p>
          )}

          {verdict && verdict !== 'incomplete' && !waiting && !summary?.stale && <p className="text-sm leading-relaxed">{verdictSentence(verdict)}</p>}

          {report && !waiting && (
            <>
              <div className="grid grid-cols-3 gap-4 border-y border-theme py-4">
                <Figure label="On this site" value={overlapPercent(report.internal?.overlap)} hint={`${report.internal?.compared ?? 0} articles`} />
                <Figure label="Web" value={overlapPercent(report.web?.overlap)} hint={report.web?.complete ? 'Finished' : 'Incomplete'} />
                <Figure
                  label="Coverage"
                  value={String((report.web?.fetched || 0) + (report.web?.cached || 0))}
                  hint={`${report.web?.queries ?? 0} searches · ${report.web?.failed ?? 0} failed`}
                />
              </div>

              <div>
                <h2 className="mb-1 text-sm font-medium">Sources</h2>
                {report.sources?.length ? (
                  <div className="border-t border-theme">
                    {report.sources.map((source) => (
                      <Source key={`${source.kind}-${source.url || source.postId}-${source.target || ''}`} source={source} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No overlapping passages in the sources this check compared.</p>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
