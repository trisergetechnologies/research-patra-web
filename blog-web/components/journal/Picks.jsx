'use client';

import Link from 'next/link';
import { PostCard } from './PostBits';
import { formatCount } from '@/lib/format';
import { useVisitorPicks } from '@/lib/picks';

/** "Trending now": a few of the most-read posts, varied per visitor and ranked by reads. */
export function TrendingList({ items, count = 4 }) {
  const picks = useVisitorPicks(items, count, 'trending');
  return (
    <ol>
      {picks.map((p, i) => (
        <li key={p.slug}>
          <span className="j-rank">{i + 1}</span>
          <div>
            <span className="j-cat">{p.category.name}</span>
            <h4>
              <Link href={`/${p.slug}`}>{p.title}</Link>
            </h4>
            <div className="j-cm" style={{ marginTop: 6 }}>
              <span>{p.readingTime} min read</span>
              <span className="j-dot" />
              <span>{formatCount(p.views)} reads</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** "Keep reading": picks from the closest matches, different per visitor and per article. */
export function RelatedGrid({ items, count = 3, seedKey }) {
  const picks = useVisitorPicks(items, count, seedKey);
  return (
    <div className="j-grid">
      {picks.map((p) => <PostCard key={p.slug} post={p} />)}
    </div>
  );
}
