import { Post, POST_STATUS as S, REVISION_STATE as R, CONTENT_KEYS } from '../models/Post.js';
import { Media } from '../models/Media.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { AuthorProfile } from '../models/AuthorProfile.js';
import { ROLES } from '../config/roles.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify, uniqueSlug } from '../utils/slug.js';
import { readingTime, sanitizePostHtml, stripTags } from '../utils/html.js';
import { can, editTarget } from '../policies/post.policy.js';
import { ensureAuthorProfile } from './author.service.js';
import { audit } from './audit.service.js';
import { revalidateBlog } from './revalidate.service.js';
import * as review from './review.service.js';

const isAdmin = (user) => user.role === ROLES.ADMIN;

export const POST_POPULATE = [
  { path: 'category', select: 'name slug color' },
  { path: 'tags', select: 'name slug' },
  { path: 'coverImage' },
  { path: 'ogImage' },
  { path: 'author', populate: { path: 'avatar' } },
  { path: 'reviewedBy', populate: { path: 'avatar' } },
  { path: 'createdBy', select: 'name email role' },
  { path: 'updatedBy', select: 'name' },
  { path: 'pendingRevision.category', select: 'name slug color' },
  { path: 'pendingRevision.tags', select: 'name slug' },
  { path: 'pendingRevision.coverImage' },
  { path: 'pendingRevision.ogImage' },
];

export const loadPostForCms = (id) => Post.findById(id).populate(POST_POPULATE);

/* ---------- guards ---------- */

function assertCan(user, action, post, message) {
  if (!can(user, action, post)) throw ApiError.forbidden(message || `You can't ${action.replace(/([A-Z])/g, ' $1').toLowerCase()} this post`);
}

function assertVersion(post, version) {
  if (version !== post.version) {
    const err = new ApiError(409, 'This post was changed by someone else. Reload to get the latest version.');
    err.code = 'VERSION_CONFLICT';
    throw err;
  }
}

/** Content must be complete before it goes to review or goes live. */
function assertPublishable(content) {
  const issues = [];
  if (!content.title?.trim()) issues.push({ path: 'title', message: 'Title is required' });
  if (!content.excerpt?.trim() || content.excerpt.trim().length < 30) issues.push({ path: 'excerpt', message: 'Excerpt needs at least 30 characters' });
  if (stripTags(content.contentHtml).split(' ').filter(Boolean).length < 50) issues.push({ path: 'contentHtml', message: 'Content needs at least 50 words' });
  if (!content.category) issues.push({ path: 'category', message: 'Choose a category' });
  if (issues.length) throw ApiError.badRequest('This post is not ready yet', issues);
}

const slugTaken = (excludeId) => (slug) =>
  Post.exists({ _id: { $ne: excludeId }, $or: [{ slug }, { slugHistory: slug }] });

/* ---------- input -> stored content ---------- */

async function assertMedia(id, slot, path) {
  if (id === null) return null;
  const media = await Media.findById(id).select('slot');
  if (!media) throw ApiError.badRequest('Validation failed', [{ path, message: 'Image not found' }]);
  if (media.slot !== slot) throw ApiError.badRequest('Validation failed', [{ path, message: `Pick a ${slot} image` }]);
  return media._id;
}

/** Turns validated request fields into stored values: checks references exist, sanitizes HTML. Only keys present in `data` are returned. */
async function buildContent(data) {
  const out = {};
  for (const key of ['title', 'excerpt', 'keyTakeaways', 'seo', 'seriesOrder']) if (data[key] !== undefined) out[key] = data[key];
  if (data.series !== undefined) out.series = data.series.replace(/\s+/g, ' ');
  if (data.contentHtml !== undefined) out.contentHtml = sanitizePostHtml(data.contentHtml);

  if (data.coverImage !== undefined) out.coverImage = await assertMedia(data.coverImage, 'cover', 'coverImage');
  if (data.ogImage !== undefined) out.ogImage = await assertMedia(data.ogImage, 'og', 'ogImage');

  if (data.category !== undefined) {
    if (data.category !== null && !(await Category.exists({ _id: data.category }))) {
      throw ApiError.badRequest('Validation failed', [{ path: 'category', message: 'Category not found' }]);
    }
    out.category = data.category;
  }
  if (data.tags !== undefined) {
    const ids = [...new Set(data.tags)];
    if ((await Tag.countDocuments({ _id: { $in: ids } })) !== ids.length) {
      throw ApiError.badRequest('Validation failed', [{ path: 'tags', message: 'One or more tags not found' }]);
    }
    out.tags = ids;
  }
  return out;
}

const pickContent = (doc) => {
  const plain = doc.toObject({ depopulate: true });
  return Object.fromEntries(CONTENT_KEYS.map((k) => [k, plain[k]]));
};

async function applySlug(user, post, rawSlug) {
  const next = slugify(rawSlug);
  if (!next) throw ApiError.badRequest('Validation failed', [{ path: 'slug', message: 'Slug is invalid' }]);
  if (next === post.slug) return null;
  assertCan(user, 'changeSlug', post, 'The URL of a published post can only be changed by an admin');
  if (await slugTaken(post._id)(next)) {
    // Taking back one of this post's own old slugs is fine.
    if (!post.slugHistory.includes(next) || (await Post.exists({ _id: { $ne: post._id }, $or: [{ slug: next }, { slugHistory: next }] }))) {
      throw ApiError.badRequest('Validation failed', [{ path: 'slug', message: 'This URL is already used by another post' }]);
    }
  }
  const old = post.slug;
  // Only URLs that were ever public need a redirect.
  if (post.publishedAt) post.slugHistory = [...new Set([...post.slugHistory.filter((s) => s !== next), old])];
  else post.slugHistory = post.slugHistory.filter((s) => s !== next);
  post.slug = next;
  return old;
}

async function applyFeatured(user, post, featured) {
  assertCan(user, 'feature', post);
  post.featured = featured;
}

async function assertAuthorExists(id, path) {
  if (id !== null && !(await AuthorProfile.exists({ _id: id }))) {
    throw ApiError.badRequest('Validation failed', [{ path, message: 'Author not found' }]);
  }
}

// Fields whose change moves the public "Updated" date; SEO, images, featuring and authorship don't.
const TEXT_KEYS = ['title', 'excerpt', 'contentHtml', 'keyTakeaways'];
const touchesText = (keys) => keys.some((k) => TEXT_KEYS.includes(k));

async function clearOtherFeatured(post) {
  if (post.featured) await Post.updateMany({ _id: { $ne: post._id }, featured: true }, { $set: { featured: false } });
}

function publicChange(post, extraSlugs = []) {
  revalidateBlog({ slugs: [post.slug, ...extraSlugs], tags: ['posts', 'categories', 'tags', 'authors'] });
}

/* ---------- commands ---------- */

export async function createPost(user, data) {
  const content = await buildContent(data);

  let author;
  if (data.author && isAdmin(user)) {
    author = await AuthorProfile.findById(data.author);
    if (!author) throw ApiError.badRequest('Validation failed', [{ path: 'author', message: 'Author not found' }]);
  } else {
    author = await ensureAuthorProfile(user);
  }

  const slug = await uniqueSlug(slugify(data.slug || data.title), slugTaken(null));
  const post = new Post({
    ...content,
    slug,
    author: author._id,
    createdBy: user._id,
    updatedBy: user._id,
    status: S.DRAFT,
    readingTime: readingTime(content.contentHtml),
  });
  if (data.featured !== undefined && isAdmin(user)) post.featured = data.featured;
  if (data.reviewedBy && isAdmin(user)) {
    await assertAuthorExists(data.reviewedBy, 'reviewedBy');
    post.reviewedBy = data.reviewedBy;
  }

  await post.save();
  await clearOtherFeatured(post);
  await audit(user, 'post.create', 'Post', post._id, { title: post.title });
  return post;
}

export async function updatePost(user, post, data) {
  assertVersion(post, data.version);
  let target = editTarget(user, post);
  if (!target) throw ApiError.forbidden("You can't edit this post right now");
  // Admins may deliberately edit the live copy even while a revision exists.
  if (isAdmin(user) && data.target === 'live') target = 'live';

  const content = await buildContent(data);
  const changed = Object.keys(content);
  const wasPublished = post.status === S.PUBLISHED;
  let oldSlug = null;

  if (target === 'live') {
    Object.assign(post, content);
    if (content.contentHtml !== undefined) post.readingTime = readingTime(post.contentHtml);
    // Staff picking up review feedback starts a fresh draft; the note stays visible until resubmission.
    if (post.status === S.CHANGES_REQUESTED && !isAdmin(user)) post.status = S.DRAFT;
  } else {
    if (!post.pendingRevision) post.pendingRevision = { ...pickContent(post), state: R.DRAFT };
    Object.assign(post.pendingRevision, content);
    if (post.pendingRevision.state === R.CHANGES_REQUESTED && !isAdmin(user)) post.pendingRevision.state = R.DRAFT;
    post.pendingRevision.updatedBy = user._id;
  }

  if (data.slug !== undefined) {
    oldSlug = await applySlug(user, post, data.slug);
    if (oldSlug) changed.push('slug');
  }
  if (data.author !== undefined) {
    assertCan(user, 'changeAuthor', post);
    await assertAuthorExists(data.author, 'author');
    post.author = data.author;
    changed.push('author');
  }
  if (data.reviewedBy !== undefined && String(data.reviewedBy) !== String(post.reviewedBy?._id ?? post.reviewedBy)) {
    assertCan(user, 'changeAuthor', post);
    await assertAuthorExists(data.reviewedBy, 'reviewedBy');
    post.reviewedBy = data.reviewedBy;
    changed.push('reviewedBy');
  }
  if (wasPublished && target === 'live' && touchesText(changed)) post.contentUpdatedAt = new Date();
  if (data.featured !== undefined && data.featured !== post.featured) {
    await applyFeatured(user, post, data.featured);
    changed.push('featured');
  }

  post.updatedBy = user._id;
  await post.save();
  await clearOtherFeatured(post);
  await audit(user, 'post.update', 'Post', post._id, { target, fields: changed });

  if (wasPublished && (target === 'live' || oldSlug || ['featured', 'author', 'reviewedBy'].some((k) => changed.includes(k)))) {
    publicChange(post, oldSlug ? [oldSlug] : []);
  }
  return post;
}

export async function submitPost(user, post, version) {
  assertVersion(post, version);
  assertCan(user, 'submit', post);
  await review.assertNoOpenMustFix(post);

  if (post.status === S.PUBLISHED) {
    assertPublishable(post.pendingRevision);
    post.pendingRevision.state = R.IN_REVIEW;
    post.pendingRevision.submittedAt = new Date();
    post.pendingRevision.reviewNote = '';
  } else {
    assertPublishable(post);
    post.status = S.IN_REVIEW;
    post.submittedAt = new Date();
  }
  post.updatedBy = user._id;
  await post.save();
  const round = await review.recordSubmission(user, post);
  await audit(user, 'post.submit', 'Post', post._id, { revision: post.status === S.PUBLISHED, round });
  return post;
}

export async function approvePost(user, post, version) {
  assertVersion(post, version);
  assertCan(user, 'approve', post);

  const mergedRevision = !!post.pendingRevision;
  if (post.pendingRevision) {
    assertPublishable(post.pendingRevision);
    const next = pickContent(post.pendingRevision);
    const current = pickContent(post);
    if (TEXT_KEYS.some((k) => JSON.stringify(next[k]) !== JSON.stringify(current[k]))) post.contentUpdatedAt = new Date();
    Object.assign(post, next);
    post.readingTime = readingTime(post.contentHtml);
    post.pendingRevision = null;
  } else {
    assertPublishable(post);
  }

  post.status = S.PUBLISHED;
  post.publishedAt = post.publishedAt || new Date();
  post.reviewNote = '';
  post.submittedAt = null;
  post.updatedBy = user._id;
  await post.save();
  await review.closeCycle(post);
  await audit(user, 'post.publish', 'Post', post._id, { mergedRevision });
  publicChange(post);
  return post;
}

export async function requestChanges(user, post, version, note = '') {
  assertVersion(post, version);
  assertCan(user, 'requestChanges', post);
  if (note.length < 3 && !(await review.countDrafts(user, post))) {
    throw ApiError.badRequest('Add a comment or a note for the writer');
  }

  if (post.pendingRevision?.state === R.IN_REVIEW) {
    post.pendingRevision.state = R.CHANGES_REQUESTED;
    post.pendingRevision.reviewNote = note;
  } else {
    post.status = S.CHANGES_REQUESTED;
    post.reviewNote = note;
  }
  post.updatedBy = user._id;
  await post.save();
  const comments = await review.publishDrafts(user, post, note);
  await audit(user, 'post.request_changes', 'Post', post._id, { note, comments });
  return post;
}

export async function discardRevision(user, post, version) {
  assertVersion(post, version);
  assertCan(user, 'discardRevision', post);
  post.pendingRevision = null;
  post.updatedBy = user._id;
  await post.save();
  await review.closeCycle(post);
  await audit(user, 'post.discard_revision', 'Post', post._id);
  return post;
}

export async function unpublishPost(user, post, version) {
  assertVersion(post, version);
  assertCan(user, 'unpublish', post);
  post.status = S.DRAFT;
  post.featured = false;
  post.updatedBy = user._id;
  await post.save();
  await audit(user, 'post.unpublish', 'Post', post._id);
  publicChange(post);
  return post;
}

export async function archivePost(user, post, version) {
  assertVersion(post, version);
  assertCan(user, 'archive', post);
  const wasPublished = post.status === S.PUBLISHED;
  post.status = S.ARCHIVED;
  post.featured = false;
  post.updatedBy = user._id;
  await post.save();
  await review.closeCycle(post);
  await audit(user, 'post.archive', 'Post', post._id);
  if (wasPublished) publicChange(post);
  return post;
}

/** Restored posts always come back as drafts, so nothing goes live again without a deliberate publish. */
export async function restorePost(user, post, version) {
  assertVersion(post, version);
  assertCan(user, 'restore', post);
  post.deletedAt = null;
  post.status = S.DRAFT;
  post.updatedBy = user._id;
  await post.save();
  await audit(user, 'post.restore', 'Post', post._id);
  return post;
}

export async function deletePost(user, post, version) {
  assertVersion(post, version);
  assertCan(user, 'delete', post);
  const wasPublished = post.status === S.PUBLISHED;
  post.deletedAt = new Date();
  post.featured = false;
  post.updatedBy = user._id;
  await post.save();
  await review.closeCycle(post);
  await audit(user, 'post.delete', 'Post', post._id);
  if (wasPublished) publicChange(post);
  return post;
}
