import Link from 'next/link';
import { pageList } from '@/lib/format';

/** Crawlable pagination: every page number is a real link. `hrefFor(n)` builds the URL for page n. */
export default function Pager({ current, total, hrefFor }) {
  if (total <= 1) return null;
  return (
    <nav className="j-pager" aria-label="Pagination">
      {current > 1 ? (
        <Link href={hrefFor(current - 1)} rel="prev" aria-label="Previous page">&larr;</Link>
      ) : (
        <span className="j-off" aria-hidden="true">&larr;</span>
      )}
      {pageList(current, total).map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`}>…</span>
        ) : (
          <Link key={n} href={hrefFor(n)} aria-current={n === current ? 'page' : undefined}>
            {n}
          </Link>
        )
      )}
      {current < total ? (
        <Link href={hrefFor(current + 1)} rel="next" aria-label="Next page">&rarr;</Link>
      ) : (
        <span className="j-off" aria-hidden="true">&rarr;</span>
      )}
    </nav>
  );
}
