import { Post, POST_STATUS as S } from '../models/Post.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { AuthorProfile } from '../models/AuthorProfile.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/slug.js';
import { mediaUrl, publicImage } from '../services/media.service.js';

const LIVE = Object.freeze({ status: S.PUBLISHED, deletedAt: null });
const SUMMARY_FIELDS = '-contentHtml -keyTakeaways -seo -pendingRevision -slugHistory -createdBy -updatedBy -reviewNote -helpful -reviewedBy';
export const SUMMARY_POPULATE = [
  { path: 'category', select: 'name slug color' },
  { path: 'tags', select: 'name slug' },
  { path: 'author', populate: { path: 'avatar' } },
  { path: 'coverImage' },
];
export const FULL_POPULATE = [...SUMMARY_POPULATE, { path: 'ogImage' }, { path: 'reviewedBy', populate: { path: 'avatar' } }];
const SORTS = {
  latest: { publishedAt: -1 },
  popular: { views: -1, publishedAt: -1 },
  quick: { readingTime: 1, publishedAt: -1 },
};

const str = (v, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const int = (v, def, max) => Math.min(max, Math.max(1, Number.parseInt(v, 10) || def));

const avatarUrl = (media) => (media?.publicId ? mediaUrl(media.publicId, { w: 192, h: 192 }) : null);

const author = (a) =>
  a?.displayName
    ? {
        slug: a.slug,
        name: a.displayName,
        role: a.roleTitle || '',
        bio: a.bio || '',
        avatar: avatarUrl(a.avatar),
        credentials: a.credentials || '',
        expertise: a.expertise || [],
        links: Object.fromEntries(Object.entries(a.links || {}).filter(([, v]) => v)),
      }
    : null;

function summary(p) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: publicImage(p.coverImage),
    category: p.category ? { slug: p.category.slug, name: p.category.name, color: p.category.color } : null,
    tags: (p.tags || []).filter((t) => t?.slug).map((t) => ({ slug: t.slug, name: t.name })),
    author: author(p.author),
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
    readingTime: p.readingTime,
    views: p.views,
    featured: p.featured,
  };
}

export function full(p) {
  return {
    ...summary(p),
    contentHtml: p.contentHtml,
    keyTakeaways: p.keyTakeaways,
    reviewedBy: author(p.reviewedBy),
    modifiedAt: p.contentUpdatedAt || p.publishedAt || null,
    series: p.series ? { name: p.series, order: p.seriesOrder ?? null, parts: [] } : null,
    seo: {
      metaTitle: p.seo?.metaTitle || '',
      metaDescription: p.seo?.metaDescription || '',
      canonical: p.seo?.canonical || '',
      noindex: !!p.seo?.noindex,
      ogImage: p.ogImage?.publicId ? mediaUrl(p.ogImage.publicId, { w: 1200, h: 630 }) : null,
    },
  };
}

const findSummaries = (filter, sort, skip, limit) =>
  Post.find(filter).select(SUMMARY_FIELDS).populate(SUMMARY_POPULATE).sort(sort).skip(skip).limit(limit).lean();

const idBySlug = async (Model, slug) => (slug ? (await Model.findOne({ slug }).select('_id').lean())?._id ?? null : undefined);

export const MAX_PAGE = 50;
export const MAX_LIMIT = 24;
const MIN_SEARCH = 2;

export const listPosts = asyncHandler(async (req, res) => {
  const page = int(req.query.page, 1, MAX_PAGE);
  const limit = int(req.query.limit, 9, MAX_LIMIT);
  const q = str(req.query.q, 100);
  if (q && q.length < MIN_SEARCH) return res.json({ items: [], total: 0, page, totalPages: 1 });
  const and = [LIVE];

  const [catId, tagId, authorId] = await Promise.all([
    idBySlug(Category, str(req.query.category)),
    idBySlug(Tag, str(req.query.tag)),
    idBySlug(AuthorProfile, str(req.query.author)),
  ]);
  // An unknown slug matches nothing rather than being ignored.
  if (catId === null || tagId === null || authorId === null) return res.json({ items: [], total: 0, page, totalPages: 1 });
  if (catId) and.push({ category: catId });
  if (tagId) and.push({ tags: tagId });
  if (authorId) and.push({ author: authorId });
  if (str(req.query.exclude)) and.push({ slug: { $ne: str(req.query.exclude) } });

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    const [cats, tags, authors] = await Promise.all([
      Category.find({ name: rx }).select('_id').lean(),
      Tag.find({ name: rx }).select('_id').lean(),
      AuthorProfile.find({ displayName: rx }).select('_id').lean(),
    ]);
    and.push({
      $or: [
        { title: rx },
        { excerpt: rx },
        { category: { $in: cats.map((c) => c._id) } },
        { tags: { $in: tags.map((t) => t._id) } },
        { author: { $in: authors.map((a) => a._id) } },
      ],
    });
  }

  const filter = { $and: and };
  const [items, total] = await Promise.all([
    findSummaries(filter, SORTS[req.query.sort] || SORTS.latest, (page - 1) * limit, limit),
    Post.countDocuments(filter),
  ]);
  res.json({ items: items.map(summary), total, page, totalPages: Math.min(MAX_PAGE, Math.max(1, Math.ceil(total / limit))) });
});

export const featuredPost = asyncHandler(async (req, res) => {
  let [post] = await findSummaries({ ...LIVE, featured: true }, SORTS.latest, 0, 1);
  if (!post) [post] = await findSummaries(LIVE, SORTS.latest, 0, 1);
  if (!post) throw ApiError.notFound('No posts yet');
  res.json({ post: summary(post) });
});

export const trendingPosts = asyncHandler(async (req, res) => {
  const filter = { ...LIVE };
  if (str(req.query.exclude)) filter.slug = { $ne: str(req.query.exclude) };
  const items = await findSummaries(filter, SORTS.popular, 0, int(req.query.limit, 4, 12));
  res.json({ items: items.map(summary) });
});

export const getPost = asyncHandler(async (req, res) => {
  const slug = str(req.params.slug, 120).toLowerCase();
  const post = await Post.findOne({ ...LIVE, slug })
    .select('-pendingRevision -createdBy -updatedBy -reviewNote -helpful')
    .populate(FULL_POPULATE)
    .lean();
  if (post) {
    const out = full(post);
    if (out.series) {
      const parts = await Post.find({ ...LIVE, series: post.series })
        .sort({ seriesOrder: 1, publishedAt: 1 })
        .select('slug title seriesOrder')
        .limit(30)
        .lean();
      out.series.parts = parts.map((p) => ({ slug: p.slug, title: p.title }));
    }
    return res.json({ post: out });
  }

  const moved = await Post.findOne({ ...LIVE, slugHistory: slug }).select('slug').lean();
  if (moved) return res.json({ redirectTo: moved.slug });
  throw ApiError.notFound('Post not found');
});

const findLive = async (slug) => {
  const post = await Post.findOne({ ...LIVE, slug: str(slug).toLowerCase() }).select('category tags publishedAt').lean();
  if (!post) throw ApiError.notFound('Post not found');
  return post;
};

export const relatedPosts = asyncHandler(async (req, res) => {
  const post = await findLive(req.params.slug);
  const limit = int(req.query.limit, 3, 12);
  const tagIds = new Set((post.tags || []).map(String));

  const candidates = await findSummaries(
    { ...LIVE, _id: { $ne: post._id }, $or: [{ category: post.category }, { tags: { $in: post.tags || [] } }] },
    SORTS.popular,
    0,
    40
  );
  const scored = candidates
    .map((p) => ({
      p,
      score: (String(p.category?._id) === String(post.category) ? 3 : 0) + (p.tags || []).filter((t) => tagIds.has(String(t._id))).length,
    }))
    .sort((a, b) => b.score - a.score || b.p.views - a.p.views)
    .slice(0, limit)
    .map(({ p }) => p);

  if (scored.length < limit) {
    const have = [post._id, ...scored.map((p) => p._id)];
    scored.push(...(await findSummaries({ ...LIVE, _id: { $nin: have } }, SORTS.latest, 0, limit - scored.length)));
  }
  res.json({ items: scored.map(summary) });
});

export const adjacentPosts = asyncHandler(async (req, res) => {
  const post = await findLive(req.params.slug);
  const pick = (p) => (p ? { slug: p.slug, title: p.title } : null);
  const [newer, older] = await Promise.all([
    Post.findOne({ ...LIVE, publishedAt: { $gt: post.publishedAt } }).sort({ publishedAt: 1 }).select('slug title').lean(),
    Post.findOne({ ...LIVE, publishedAt: { $lt: post.publishedAt } }).sort({ publishedAt: -1 }).select('slug title').lean(),
  ]);
  res.json({ newer: pick(newer), older: pick(older) });
});

async function liveCounts(field) {
  const rows = await Post.aggregate([{ $match: { ...LIVE } }, { $unwind: `$${field}` }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }]);
  return new Map(rows.map((r) => [String(r._id), r.n]));
}

export const listCategories = asyncHandler(async (req, res) => {
  const [cats, counts] = await Promise.all([Category.find().sort({ name: 1 }).lean(), liveCounts('category')]);
  res.json({
    items: cats.map((c) => ({ slug: c.slug, name: c.name, description: c.description, color: c.color, count: counts.get(String(c._id)) ?? 0 })),
  });
});

export const listTags = asyncHandler(async (req, res) => {
  const [tags, counts] = await Promise.all([Tag.find().lean(), liveCounts('tags')]);
  const items = tags
    .map((t) => ({ slug: t.slug, name: t.name, count: counts.get(String(t._id)) ?? 0 }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, int(req.query.limit, 1000, 1000));
  res.json({ items });
});

export const getAuthor = asyncHandler(async (req, res) => {
  const profile = await AuthorProfile.findOne({ slug: str(req.params.slug).toLowerCase() }).populate('avatar').lean();
  if (!profile) throw ApiError.notFound('Author not found');
  res.json({ author: author(profile) });
});

export const sitemap = asyncHandler(async (req, res) => {
  const [posts, catCounts, tagCounts, authors] = await Promise.all([
    Post.find({ ...LIVE, 'seo.noindex': { $ne: true } }).select('slug updatedAt contentUpdatedAt publishedAt author').sort({ publishedAt: -1 }).lean(),
    liveCounts('category'),
    liveCounts('tags'),
    AuthorProfile.find().select('slug').lean(),
  ]);
  const [cats, tags] = await Promise.all([
    Category.find({ _id: { $in: [...catCounts.keys()] } }).select('slug').lean(),
    Tag.find({ _id: { $in: [...tagCounts.keys()] } }).select('slug').lean(),
  ]);
  const withPosts = new Set(posts.map((p) => String(p.author)));
  res.json({
    posts: posts.map((p) => ({ slug: p.slug, updatedAt: p.contentUpdatedAt || p.publishedAt || p.updatedAt })),
    categories: cats.map((c) => ({ slug: c.slug })),
    tags: tags.map((t) => ({ slug: t.slug })),
    authors: authors.filter((a) => withPosts.has(String(a._id))).map((a) => ({ slug: a.slug })),
  });
});

/* ---------- views & votes ---------- */

// Remembers a value per key for `ttl` ms; bounded so it can't grow without limit.
function memo(ttl, max = 50_000) {
  const store = new Map();
  return {
    get(key) {
      const hit = store.get(key);
      return hit && Date.now() - hit.at < ttl ? hit.value : undefined;
    },
    set(key, value) {
      const now = Date.now();
      if (store.size > max) {
        for (const [k, v] of store) if (now - v.at >= ttl) store.delete(k);
        if (store.size > max) store.clear();
      }
      store.set(key, { value, at: now });
    },
  };
}

// One view per visitor per post per 30 minutes.
const views = memo(30 * 60 * 1000);
function firstViewInWindow(key) {
  if (views.get(key)) return false;
  views.set(key, true);
  return true;
}

// One helpful vote per visitor per post per day; changing your mind moves the vote instead of adding one.
const votes = memo(24 * 60 * 60 * 1000);

export const recordVote = asyncHandler(async (req, res) => {
  const slug = str(req.params.slug).toLowerCase();
  const value = req.body?.helpful === true ? 'yes' : req.body?.helpful === false ? 'no' : null;
  if (!slug || !value) throw ApiError.badRequest('Send { helpful: true | false }');
  const key = `${req.ip}|${slug}`;
  const previous = votes.get(key);
  if (previous !== value) {
    const inc = { [`helpful.${value}`]: 1, ...(previous ? { [`helpful.${previous}`]: -1 } : {}) };
    const result = await Post.updateOne({ ...LIVE, slug }, { $inc: inc }, { timestamps: false });
    if (!result.matchedCount) throw ApiError.notFound('Post not found');
    votes.set(key, value);
  }
  res.status(204).end();
});

export const recordView = asyncHandler(async (req, res) => {
  const slug = str(req.params.slug).toLowerCase();
  if (slug && firstViewInWindow(`${req.ip}|${slug}`)) {
    await Post.updateOne({ ...LIVE, slug }, { $inc: { views: 1 } }, { timestamps: false });
  }
  res.status(204).end();
});
