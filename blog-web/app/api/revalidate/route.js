import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { TAGS } from '@/lib/api';

/**
 * Called by the CMS backend after a post is published, updated, unpublished or renamed.
 *
 *   POST /blog/api/revalidate
 *   Header: x-revalidate-secret: <REVALIDATE_SECRET>
 *   Body:   { "slugs": ["new-slug", "old-slug"], "tags": ["categories"] }   (all optional)
 *
 * Always refreshes list pages, the sitemap and the feed; each slug also refreshes that article.
 */
function authorized(req) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get('x-revalidate-secret') || '';
  if (!secret || given.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}

const KNOWN = new Set([TAGS.posts, TAGS.categories, TAGS.tags, TAGS.authors]);

export async function POST(req) {
  if (!authorized(req)) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let body = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is fine */
  }

  const slugs = (Array.isArray(body.slugs) ? body.slugs : []).filter((s) => typeof s === 'string' && s).slice(0, 50);
  const extra = (Array.isArray(body.tags) ? body.tags : []).filter((t) => KNOWN.has(t));
  const tags = [...new Set([TAGS.posts, ...extra, ...slugs.map(TAGS.post)])];

  // A webhook needs the next request to see fresh data, not a stale-while-revalidate copy.
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));
  // Rendered pages are cached too, so also purge the route cache.
  revalidatePath('/', 'layout');

  return Response.json({ ok: true, revalidated: tags });
}
