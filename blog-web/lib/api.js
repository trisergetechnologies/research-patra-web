/**
 * Server-side data access for the blog, backed by the CMS at `${BLOG_API_URL}`. Pages never call fetch directly.
 *
 * Backend contract (all GET, JSON, published posts only):
 *   /public/posts?page(≤50)&limit(≤24)&category&tag&author&q(2–100 chars)&sort(latest|popular|quick)&exclude
 *        -> { items: PostSummary[], total, page, totalPages }
 *   /public/posts/featured                 -> { post: PostSummary }
 *   /public/posts/trending?limit(≤12)&exclude -> { items: PostSummary[] }
 *   /public/posts/:slug                    -> { post: Post } | { redirectTo: newSlug } | 404
 *   /public/posts/:slug/related?limit(≤12) -> { items: PostSummary[] }, best matches first
 *   /public/posts/:slug/adjacent           -> { newer: {slug,title}|null, older: {slug,title}|null }
 *   /public/categories                     -> { items: [{ slug, name, description, count, color?: {from,to} }] }
 *   /public/tags?limit                     -> { items: [{ slug, name, count }] }
 *   /public/authors/:slug                  -> { author: { slug, name, role, bio, avatar, credentials, expertise[], links{} } } | 404
 *   /public/sitemap                        -> { posts: [{slug, updatedAt}], categories: [{slug}], tags: [{slug}], authors: [{slug}] }
 *
 * Post: { slug, title, excerpt, contentHtml, keyTakeaways[], coverImage?: {url, alt, width, height},
 *         category: {slug, name, color?}, tags: [{slug, name}], author: {slug, name, role, bio, avatar},
 *         publishedAt, updatedAt, readingTime, views, featured,
 *         seo?: { metaTitle, metaDescription, canonical, ogImage, noindex },
 *         reviewedBy?: Author, modifiedAt, series?: { name, order, parts: [{slug, title}] } }
 *
 * After publishing/updating, the backend POSTs to /blog/api/revalidate with the tags below.
 */
import { cache } from 'react';
import { estimateReadingTime, processHtml, slugify } from './content';
import { PAGE_SIZE, REVALIDATE_SECONDS } from './site';

const API_URL = (process.env.BLOG_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export const TAGS = {
  posts: 'posts',
  post: (slug) => `post:${slug}`,
  categories: 'categories',
  tags: 'tags',
  authors: 'authors',
};

// Identifies this server to the API so its per-IP rate limits apply to browsers, not to the blog fetching for all readers.
const SERVER_HEADERS = { Accept: 'application/json', 'x-preview-secret': process.env.REVALIDATE_SECRET || '' };

async function request(path, tags) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: SERVER_HEADERS,
    next: { tags, revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Blog API ${res.status} for ${path}`);
  return res.json();
}

function qs(params) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') s.set(k, String(v));
  });
  const str = s.toString();
  return str ? `?${str}` : '';
}

const PALETTE = [
  ['#EA580C', '#7C2D12'], ['#0F766E', '#0B3B38'], ['#2563EB', '#172554'], ['#0891B2', '#083344'],
  ['#BE123C', '#4C0519'], ['#65A30D', '#1F3306'], ['#64748B', '#0F172A'], ['#7C3AED', '#2E1065'],
];

function colorFor(slug, color) {
  if (color?.from && color?.to) return color;
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const [from, to] = PALETTE[h % PALETTE.length];
  return { from, to };
}

function normalizeCategory(c) {
  if (!c) return { slug: 'uncategorized', name: 'Uncategorized', color: colorFor('uncategorized') };
  const slug = c.slug || slugify(c.name);
  return { ...c, slug, name: c.name || slug, color: colorFor(slug, c.color) };
}

function normalizeTag(t) {
  if (typeof t === 'string') return { slug: slugify(t), name: t };
  return { ...t, slug: t.slug || slugify(t.name), name: t.name || t.slug };
}

function normalizeAuthor(a) {
  if (!a || !a.name) return { slug: '', name: 'Research Patra', role: 'Editorial team', bio: '', avatar: null, credentials: '', expertise: [], links: {} };
  return {
    slug: a.slug || '',
    name: a.name,
    role: a.role || '',
    bio: a.bio || '',
    avatar: a.avatar || null,
    credentials: a.credentials || '',
    expertise: a.expertise || [],
    links: a.links || {},
  };
}

function normalizeSummary(p) {
  if (!p) return null;
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    coverImage: p.coverImage?.url ? p.coverImage : null,
    category: normalizeCategory(p.category),
    tags: (p.tags || []).map(normalizeTag),
    author: normalizeAuthor(p.author),
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt || p.publishedAt,
    readingTime: p.readingTime || (p.contentHtml ? estimateReadingTime(p.contentHtml) : 1),
    views: p.views || 0,
    featured: !!p.featured,
  };
}

function normalizePost(p) {
  const { html, toc } = processHtml(p.contentHtml || '');
  return {
    ...normalizeSummary(p),
    readingTime: p.readingTime || estimateReadingTime(html),
    contentHtml: html,
    toc,
    keyTakeaways: p.keyTakeaways || [],
    seo: p.seo || {},
    reviewedBy: p.reviewedBy ? normalizeAuthor(p.reviewedBy) : null,
    modifiedAt: p.modifiedAt || p.publishedAt,
    series: p.series?.name ? { name: p.series.name, parts: p.series.parts || [] } : null,
  };
}

/** Paginated, filtered list. Returns null-safe empty results. */
export const getPosts = cache(async ({ page = 1, limit = PAGE_SIZE, category, tag, author, q, sort, exclude } = {}) => {
  const data = await request(
    `/public/posts${qs({ page, limit, category, tag, author, q, sort, exclude })}`,
    [TAGS.posts]
  );
  return {
    items: (data?.items || []).map(normalizeSummary),
    total: data?.total || 0,
    page: data?.page || page,
    totalPages: Math.max(1, data?.totalPages || 1),
  };
});

export const getFeaturedPost = cache(async () => {
  const data = await request('/public/posts/featured', [TAGS.posts]);
  return normalizeSummary(data?.post);
});

export const getTrendingPosts = cache(async (limit = 4, exclude) => {
  const data = await request(`/public/posts/trending${qs({ limit, exclude })}`, [TAGS.posts]);
  return (data?.items || []).map(normalizeSummary);
});

/** Full post with sanitized HTML and TOC; { redirectTo } for renamed slugs; null when missing. */
export const getPost = cache(async (slug) => {
  // Also tagged "posts": the series box lists sibling parts, which change when another part is published.
  const data = await request(`/public/posts/${encodeURIComponent(slug)}`, [TAGS.post(slug), TAGS.posts]);
  if (!data) return null;
  if (data.redirectTo) return { redirectTo: data.redirectTo };
  return data.post ? normalizePost(data.post) : null;
});

export const getRelatedPosts = cache(async (slug, limit = 3) => {
  const data = await request(`/public/posts/${encodeURIComponent(slug)}/related${qs({ limit })}`, [TAGS.posts]);
  return (data?.items || []).map(normalizeSummary);
});

export const getAdjacentPosts = cache(async (slug) => {
  const data = await request(`/public/posts/${encodeURIComponent(slug)}/adjacent`, [TAGS.posts]);
  return { newer: data?.newer || null, older: data?.older || null };
});

export const getCategories = cache(async () => {
  const data = await request('/public/categories', [TAGS.categories, TAGS.posts]);
  return (data?.items || []).map((c) => ({ ...normalizeCategory(c), description: c.description || '', count: c.count || 0 }));
});

export const getCategory = cache(async (slug) => {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) || null;
});

export const getTags = cache(async (limit) => {
  const data = await request(`/public/tags${qs({ limit })}`, [TAGS.tags, TAGS.posts]);
  return (data?.items || []).map((t) => ({ ...normalizeTag(t), count: t.count || 0 }));
});

export const getAuthor = cache(async (slug) => {
  const data = await request(`/public/authors/${encodeURIComponent(slug)}`, [TAGS.authors]);
  return data?.author ? normalizeAuthor(data.author) : null;
});

/* ---------- private preview (server only, never cached) ---------- */

const previewHeaders = (extra = {}) => ({ ...SERVER_HEADERS, ...extra });

/** Swaps a one-time ticket from the editor for a 30-minute preview session. Returns null if the ticket is invalid. */
export async function exchangePreviewTicket(postId, ticket) {
  const res = await fetch(`${API_URL}/preview/exchange`, {
    method: 'POST',
    headers: previewHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ postId, ticket }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/** { post } for an authorised session, or { error: 'expired' | 'denied' | 'missing' }. */
export async function getPreviewPost(postId, session) {
  if (!session) return { error: 'expired' };
  const res = await fetch(`${API_URL}/preview/posts/${encodeURIComponent(postId)}`, {
    headers: previewHeaders({ Authorization: `Bearer ${session}` }),
    cache: 'no-store',
  });
  if (res.status === 401) return { error: 'expired' };
  if (res.status === 403) return { error: 'denied' };
  if (res.status === 404) return { error: 'missing' };
  if (!res.ok) throw new Error(`Preview API ${res.status}`);
  const { post } = await res.json();
  return {
    post: {
      ...normalizePost(post),
      publishedAt: post.publishedAt || new Date().toISOString(),
      status: post.status,
      isRevision: !!post.isRevision,
    },
  };
}

export const getSitemapData = cache(async () => {
  const data = await request('/public/sitemap', [TAGS.posts, TAGS.categories, TAGS.tags, TAGS.authors]);
  return {
    posts: data?.posts || [],
    categories: data?.categories || [],
    tags: data?.tags || [],
    authors: data?.authors || [],
  };
});
