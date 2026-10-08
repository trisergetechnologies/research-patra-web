import { getPosts } from '@/lib/api';
import { MAX_PAGE, SORT_KEYS } from '@/lib/site';

/**
 * "Load more" for listing pages: GET /blog/api/posts?page=2&category=…&tag=…&author=…&q=…&sort=…&exclude=…
 * Served from the blog's data cache (same entries the pages use), so readers paging through lists don't hit the API.
 */
const text = (v, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined) || undefined;

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const page = Number.parseInt(p.get('page'), 10);
  if (!Number.isInteger(page) || page < 2 || page > MAX_PAGE) {
    return Response.json({ error: 'Invalid page' }, { status: 400 });
  }
  const sort = SORT_KEYS.includes(p.get('sort')) ? p.get('sort') : undefined;

  const list = await getPosts({
    page,
    category: text(p.get('category')),
    tag: text(p.get('tag')),
    author: text(p.get('author')),
    q: text(p.get('q'), 100),
    exclude: text(p.get('exclude')),
    sort,
  });

  return Response.json(
    { items: list.items, page: list.page, totalPages: list.totalPages },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=600' } }
  );
}
