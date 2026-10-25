import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cmsApi, errorMessage } from '../api/client';
import { useToast } from './ui/toastContext';
import { plagiarismDot, plagiarismLabel, plagiarismTone, startsScan } from '../lib/plagiarism';

export default function PlagiarismChip({ postId, summary, dirty, onChange, poll = false }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [quota, setQuota] = useState(null);
  const onChangeRef = useRef(onChange);
  const status = summary?.status || 'none';
  const canStart = startsScan(summary);
  const outOfChecks = quota != null && quota.remaining <= 0;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!canStart) return undefined;
    let cancel = false;
    cmsApi
      .plagiarismQuota()
      .then((data) => {
        if (!cancel) setQuota(data.quota);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [canStart, postId]);

  useEffect(() => {
    if (!poll || (status !== 'queued' && status !== 'running')) return undefined;
    const timer = setInterval(() => {
      cmsApi.getPlagiarism(postId).then((data) => onChangeRef.current?.(data.summary)).catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [poll, status, postId]);

  const label = busy ? 'Sending…' : plagiarismLabel(summary);
  const className = `inline-flex items-center gap-1.5 text-xs font-medium ${plagiarismTone(busy ? { status: 'queued' } : summary)}`;
  const dot = <span className={`h-1.5 w-1.5 rounded-full ${busy ? 'bg-amber-500' : plagiarismDot(summary)} ${status === 'running' ? 'animate-pulse' : ''}`} />;

  if (canStart) {
    return (
      <button
        type="button"
        className={`${className} hover:underline underline-offset-2 disabled:no-underline disabled:opacity-60`}
        disabled={busy || dirty || outOfChecks}
        title={
          dirty
            ? 'Save the article first'
            : outOfChecks
              ? `Monthly limit reached (${quota.used} of ${quota.limit}). Resets ${quota.resetMonth}.`
              : 'Check this article for overlapping passages'
        }
        onClick={() => {
          setBusy(true);
          cmsApi
            .startPlagiarism(postId)
            .then((data) => {
              onChangeRef.current?.(data.summary);
              if (data.quota) setQuota(data.quota);
            })
            .catch((err) => {
              toast.error(errorMessage(err));
              if (err?.data?.details?.quota) setQuota(err.data.details.quota);
            })
            .finally(() => setBusy(false));
        }}
      >
        {dot}
        Plagiarism · {label}
      </button>
    );
  }

  return (
    <Link to={`/admin/posts/${postId}/plagiarism`} className={`${className} hover:underline underline-offset-2`}>
      {dot}
      Plagiarism · {label}
    </Link>
  );
}
