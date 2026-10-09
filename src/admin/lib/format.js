const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function timeAgo(date) {
  if (!date) return '—';
  const secs = (new Date(date).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(secs) >= size) return rtf.format(Math.round(secs / size), unit);
  }
  return 'just now';
}

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatNumber = (n) => new Intl.NumberFormat('en', { notation: n >= 10000 ? 'compact' : 'standard' }).format(n || 0);

export const ACTION_LABELS = {
  'post.create': 'created',
  'post.update': 'edited',
  'post.submit': 'submitted for review',
  'post.publish': 'published',
  'post.request_changes': 'requested changes on',
  'post.discard_revision': 'discarded edits on',
  'post.unpublish': 'unpublished',
  'post.archive': 'archived',
  'post.restore': 'restored',
  'post.delete': 'deleted',
  'post.plagiarism': 'sent for a plagiarism check',
};
