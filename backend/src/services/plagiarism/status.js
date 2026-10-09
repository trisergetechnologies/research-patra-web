/** Same hash already queued, running, or complete is reused. A failed check can be queued again. */
export function decideEnqueue(existingForHash) {
  const active = existingForHash.find((scan) => scan.status === 'queued' || scan.status === 'running');
  if (active) return { action: 'keep', scan: active };
  const done = existingForHash.find((scan) => scan.status === 'complete');
  if (done) return { action: 'keep', scan: done };
  return { action: 'create' };
}

export function chipFor(scan, currentHash) {
  if (!scan) return { status: 'none', verdict: null, stale: false };
  const stale = scan.contentHash !== currentHash;
  if (stale) return { status: 'stale', verdict: scan.verdict || null, stale: true };
  if (scan.status === 'queued') return { status: 'queued', verdict: null, stale: false };
  if (scan.status === 'running') return { status: 'running', verdict: null, stale: false };
  if (scan.status === 'complete') return { status: 'complete', verdict: scan.verdict, stale: false };
  if (scan.status === 'failed') return { status: 'failed', verdict: 'incomplete', stale: false };
  return { status: 'incomplete', verdict: 'incomplete', stale: false };
}

/** A running scan is retried once, then closed as incomplete. */
export function staleAction(scan, now = Date.now(), staleMs = 15 * 60 * 1000) {
  if (scan.status !== 'running' || !scan.startedAt) return null;
  const started = new Date(scan.startedAt).getTime();
  if (now - started < staleMs) return null;
  return (scan.requeues || 0) >= 1 ? 'incomplete' : 'requeue';
}
