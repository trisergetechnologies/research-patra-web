export function plagiarismLabel(summary) {
  const status = summary?.status || 'none';
  if (status === 'stale') return 'Out of date';
  if (status === 'queued') return 'Queued';
  if (status === 'running') return 'Checking';
  if (status === 'incomplete' || status === 'failed') return 'Incomplete';
  if (status === 'complete') {
    if (summary.verdict === 'clear') return 'Clear';
    if (summary.verdict === 'review') return 'Review';
    if (summary.verdict === 'strong') return 'Strong overlap';
    return 'Incomplete';
  }
  return 'Not checked';
}

export function plagiarismTone(summary) {
  const status = summary?.status || 'none';
  if (status === 'complete' && summary.verdict === 'clear') return 'text-emerald-700 dark:text-emerald-400';
  if (status === 'complete' && summary.verdict === 'strong') return 'text-rose-700 dark:text-rose-400';
  if (status === 'queued' || status === 'running' || status === 'incomplete' || status === 'failed') return 'text-amber-700 dark:text-amber-400';
  if (status === 'complete' && summary.verdict === 'review') return 'text-amber-700 dark:text-amber-400';
  return 'text-muted';
}

export function plagiarismDot(summary) {
  const status = summary?.status || 'none';
  if (status === 'complete' && summary.verdict === 'clear') return 'bg-emerald-500';
  if (status === 'complete' && summary.verdict === 'strong') return 'bg-rose-500';
  if (status === 'queued' || status === 'running' || status === 'incomplete' || status === 'failed' || (status === 'complete' && summary.verdict === 'review')) return 'bg-amber-500';
  return 'bg-gray-400';
}

/** A finished check the admin can open. In-progress and out-of-date scans are not. */
export function hasPlagiarismReport(summary) {
  const status = summary?.status || 'none';
  return status === 'complete' || status === 'incomplete' || status === 'failed';
}

export const startsScan = (summary) => {
  const status = summary?.status || 'none';
  return status === 'none' || status === 'stale';
};

export function overlapPercent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

export function verdictSentence(verdict) {
  if (verdict === 'clear') return 'No significant overlap turned up in published articles, submissions in review, or the pages this check opened.';
  if (verdict === 'review') return 'Some passages overlap other sources. Read them before you publish.';
  if (verdict === 'strong') return 'A large share of this article matches other sources.';
  return 'This check did not finish. It is not a clean result.';
}
