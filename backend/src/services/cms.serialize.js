import { permissionsFor } from '../policies/post.policy.js';
import { mediaUrl, serializeMedia } from './media.service.js';

const id = (v) => (v ? String(v._id ?? v) : null);

export const serializeCategory = (c) =>
  c && c.name ? { id: id(c), name: c.name, slug: c.slug, description: c.description ?? '', color: c.color } : null;

export const serializeTag = (t) => (t && t.name ? { id: id(t), name: t.name, slug: t.slug } : null);

export const serializeAuthor = (a) =>
  a && a.displayName
    ? {
        id: id(a),
        slug: a.slug,
        displayName: a.displayName,
        roleTitle: a.roleTitle ?? '',
        bio: a.bio ?? '',
        avatar: serializeMedia(a.avatar),
        credentials: a.credentials ?? '',
        expertise: a.expertise ?? [],
        links: {
          website: a.links?.website ?? '',
          linkedin: a.links?.linkedin ?? '',
          orcid: a.links?.orcid ?? '',
          scholar: a.links?.scholar ?? '',
        },
        user: id(a.user),
      }
    : null;

export const userRef = (u) => (u && u.name ? { id: id(u), name: u.name, role: u.role } : null);

export function content(src) {
  return {
    title: src.title ?? '',
    excerpt: src.excerpt ?? '',
    contentHtml: src.contentHtml ?? '',
    keyTakeaways: src.keyTakeaways ?? [],
    coverImage: serializeMedia(src.coverImage),
    ogImage: serializeMedia(src.ogImage),
    category: serializeCategory(src.category),
    tags: (src.tags ?? []).map(serializeTag).filter(Boolean),
    seo: {
      metaTitle: src.seo?.metaTitle ?? '',
      metaDescription: src.seo?.metaDescription ?? '',
      canonical: src.seo?.canonical ?? '',
      noindex: !!src.seo?.noindex,
    },
    series: src.series ?? '',
    seriesOrder: src.seriesOrder ?? null,
  };
}

/** Lightweight row for tables. Expects category, author, createdBy and coverImage populated. */
export function serializePostRow(p) {
  return {
    id: id(p),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    status: p.status,
    featured: p.featured,
    category: serializeCategory(p.category),
    author: p.author?.displayName ? { id: id(p.author), displayName: p.author.displayName } : null,
    createdBy: userRef(p.createdBy),
    coverThumb: p.coverImage?.publicId ? mediaUrl(p.coverImage.publicId, { w: 160, h: 90 }) : null,
    revisionState: p.pendingRevision?.state ?? null,
    views: p.views,
    readingTime: p.readingTime,
    submittedAt: p.pendingRevision?.submittedAt ?? p.submittedAt ?? null,
    publishedAt: p.publishedAt ?? null,
    updatedAt: p.updatedAt,
    deleted: !!p.deletedAt,
    version: p.version,
  };
}

/** Full editor payload. Expects POST_POPULATE. */
export function serializePostDetail(p, user) {
  const rev = p.pendingRevision;
  return {
    id: id(p),
    ...content(p),
    slug: p.slug,
    slugHistory: p.slugHistory,
    status: p.status,
    reviewNote: p.reviewNote,
    featured: p.featured,
    views: p.views,
    readingTime: p.readingTime,
    author: serializeAuthor(p.author),
    reviewedBy: serializeAuthor(p.reviewedBy),
    helpful: { yes: p.helpful?.yes ?? 0, no: p.helpful?.no ?? 0 },
    createdBy: userRef(p.createdBy),
    updatedBy: userRef(p.updatedBy),
    submittedAt: p.submittedAt ?? null,
    publishedAt: p.publishedAt ?? null,
    contentUpdatedAt: p.contentUpdatedAt ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    deletedAt: p.deletedAt ?? null,
    pendingRevision: rev
      ? {
          ...content(rev),
          state: rev.state,
          reviewNote: rev.reviewNote,
          submittedAt: rev.submittedAt ?? null,
          updatedAt: rev.updatedAt,
        }
      : null,
    version: p.version,
    permissions: permissionsFor(user, p),
  };
}
