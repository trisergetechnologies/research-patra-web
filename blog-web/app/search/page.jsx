import { SORT_KEYS, SearchListing } from '@/lib/listings';
import { abs } from '@/lib/site';

// Search results are thin, duplicate views of the archive: crawlable links, never indexed.
export const metadata = {
  title: 'Search articles',
  alternates: { canonical: abs('/') },
  robots: { index: false, follow: true },
};

const one = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const sort = SORT_KEYS.includes(one(sp.sort)) ? one(sp.sort) : 'latest';
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);
  return <SearchListing q={q} sort={sort} category={one(sp.category) || undefined} tag={one(sp.tag) || undefined} page={page} />;
}
