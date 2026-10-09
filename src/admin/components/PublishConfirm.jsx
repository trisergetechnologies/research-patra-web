import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import { hasPlagiarismReport, plagiarismLabel } from '../lib/plagiarism';

export default function PublishConfirm({ open, onClose, onPublish, onReport, title, message, summary }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const ready = hasPlagiarismReport(summary);
  const inFlight = summary?.status === 'queued' || summary?.status === 'running';
  const reportLabel = ready ? 'Review report' : inFlight ? 'View check' : summary?.status === 'stale' ? 'Check again' : 'Check plagiarism';
  const note = ready
    ? `A plagiarism report is ready: ${plagiarismLabel(summary)}.`
    : inFlight
      ? 'A plagiarism check is already in progress.'
      : summary?.status === 'stale'
        ? 'The last plagiarism report is out of date.'
        : 'There is no plagiarism report for this article.';

  const close = () => {
    if (busy) return;
    setError('');
    onClose();
  };

  const run = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      await fn();
      setError('');
      onClose();
    } catch (err) {
      if (!err?.handled) setError(err?.data?.details?.[0]?.message || err?.message || 'Something went wrong');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal open={open} onClose={close} title={title} size="sm">
      {message && <p className="text-sm text-muted">{message}</p>}
      <p className={`text-sm ${message ? 'mt-3' : ''}`}>{note}</p>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" className="admin-btn-secondary" onClick={close} disabled={!!busy}>
          Cancel
        </button>
        <button type="button" className="admin-btn-secondary" disabled={!!busy} onClick={() => run('report', onReport)}>
          {busy === 'report' && <Loader2 className="w-4 h-4 animate-spin" />}
          {reportLabel}
        </button>
        <button type="button" className="admin-btn-primary" disabled={!!busy} onClick={() => run('publish', onPublish)}>
          {busy === 'publish' && <Loader2 className="w-4 h-4 animate-spin" />}
          {title}
        </button>
      </div>
    </Modal>
  );
}
