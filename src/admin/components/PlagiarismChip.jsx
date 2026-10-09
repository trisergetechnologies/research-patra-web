import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cmsApi, errorMessage } from '../api/client';
import { useToast } from './ui/toastContext';
import { plagiarismDot, plagiarismLabel, plagiarismTone, startsScan } from '../lib/plagiarism';

export default function PlagiarismChip({ postId, summary, dirty, onChange, poll = false }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const onChangeRef = useRef(onChange);
  const status = summary?.status || 'none';

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

  if (startsScan(summary)) {
    return (
      <button
        type="button"
        className={`${className} hover:underline underline-offset-2 disabled:no-underline disabled:opacity-60`}
        disabled={busy || dirty}
        title={dirty ? 'Save the article first' : 'Check this article for overlapping passages'}
        onClick={() => {
          setBusy(true);
          cmsApi
            .startPlagiarism(postId)
            .then((data) => onChangeRef.current?.(data.summary))
            .catch((err) => toast.error(errorMessage(err)))
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
