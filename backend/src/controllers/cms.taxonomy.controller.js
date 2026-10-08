import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Post, POST_STATUS as S } from '../models/Post.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { escapeRegex, slugify } from '../utils/slug.js';
import { cursorPage } from '../utils/cursor.js';
import { audit } from '../services/audit.service.js';
import { revalidateBlog } from '../services/revalidate.service.js';
import { serializeCategory, serializeTag } from '../services/cms.serialize.js';

const notDeleted = { deletedAt: null };

async function usageCounts(field, ids) {
  const rows = await Post.aggregate([
    { $match: { ...notDeleted, [field]: { $in: ids } } },
    { $unwind: `$${field}` },
    {
      $group: {
        _id: `$${field}`,
        total: { $sum: 1 },
        published: { $sum: { $cond: [{ $eq: ['$status', S.PUBLISHED] }, 1, 0] } },
      },
    },
  ]);
  return new Map(rows.map((r) => [String(r._id), { total: r.total, published: r.published }]));
}

/** Pages a name-sorted list; without a limit the editor's pickers still get everything up to `def`. */
async function listByName(Model, query, filter, field, serialize, def) {
  const page = cursorPage(query, { field: 'name', dir: 1 }, { def, max: def });
  const rows = await Model.find({ $and: [filter, page.filter] }).sort(page.sort).limit(page.limit + 1);
  const { items, nextCursor } = page.finish(rows);
  const counts = await usageCounts(field, items.map((d) => d._id));
  return {
    nextCursor,
    items: items.map((d) => ({ ...serialize(d), posts: counts.get(String(d._id)) ?? { total: 0, published: 0 } })),
  };
}

function cleanSlug(input, fallback) {
  const s = slugify(input || fallback, 60);
  if (!s) throw ApiError.badRequest('Validation failed', [{ path: 'slug', message: 'Slug is invalid' }]);
  return s;
}

async function assertFree(Model, { name, slug }, excludeId) {
  const clash = await Model.findOne({
    _id: { $ne: excludeId },
    $or: [{ slug }, ...(name ? [{ name: new RegExp(`^${escapeRegex(name)}$`, 'i') }] : [])],
  }).select('name slug');
  if (clash) {
    const path = clash.slug === slug ? 'slug' : 'name';
    throw ApiError.badRequest('Validation failed', [{ path, message: `Already used by "${clash.name}"` }]);
  }
}

const loadById = async (Model, id, label) => {
  const doc = mongoose.isValidObjectId(id) ? await Model.findById(id) : null;
  if (!doc) throw ApiError.notFound(`${label} not found`);
  return doc;
};

const taxonomyChanged = (tag) => revalidateBlog({ tags: ['posts', tag] });

/* ---------- categories ---------- */

export const listCategories = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  const filter = q ? { name: new RegExp(escapeRegex(q), 'i') } : {};
  const { items, nextCursor } = await listByName(Category, req.query, filter, 'category', serializeCategory, 200);
  res.json({ categories: items, nextCursor });
});

export const createCategory = asyncHandler(async (req, res) => {
  const slug = cleanSlug(req.body.slug, req.body.name);
  await assertFree(Category, { name: req.body.name, slug });
  const cat = await Category.create({ ...req.body, slug });
  await audit(req.user, 'category.create', 'Category', cat._id, { name: cat.name });
  taxonomyChanged('categories');
  res.status(201).json({ category: serializeCategory(cat) });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await loadById(Category, req.params.id, 'Category');
  const next = { ...req.body };
  if (next.slug !== undefined || next.name !== undefined) {
    next.slug = next.slug !== undefined ? cleanSlug(next.slug) : cat.slug;
    await assertFree(Category, { name: next.name, slug: next.slug }, cat._id);
  }
  const oldSlug = cat.slug;
  Object.assign(cat, next);
  await cat.save();
  await audit(req.user, 'category.update', 'Category', cat._id, { fields: Object.keys(req.body), oldSlug });
  taxonomyChanged('categories');
  res.json({ category: serializeCategory(cat) });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await loadById(Category, req.params.id, 'Category');
  const inUse = await Post.countDocuments({ category: cat._id, ...notDeleted });
  if (inUse) throw ApiError.conflict(`${inUse} post${inUse > 1 ? 's use' : ' uses'} this category. Move them first.`);
  // Soft-deleted posts and revisions just lose the reference.
  await Post.updateMany({ category: cat._id }, { $set: { category: null } });
  await Post.updateMany({ 'pendingRevision.category': cat._id }, { $set: { 'pendingRevision.category': null } });
  await cat.deleteOne();
  await audit(req.user, 'category.delete', 'Category', cat._id, { name: cat.name });
  taxonomyChanged('categories');
  res.status(204).end();
});

/* ---------- tags ---------- */

export const listTags = asyncHandler(async (req, res) => {
  const filter = {};
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  if (q) filter.name = new RegExp(escapeRegex(q), 'i');
  const { items, nextCursor } = await listByName(Tag, req.query, filter, 'tags', serializeTag, 500);
  res.json({ tags: items, nextCursor });
});

export const createTag = asyncHandler(async (req, res) => {
  const slug = cleanSlug(req.body.slug, req.body.name);
  await assertFree(Tag, { name: req.body.name, slug });
  const tag = await Tag.create({ name: req.body.name, slug });
  await audit(req.user, 'tag.create', 'Tag', tag._id, { name: tag.name });
  res.status(201).json({ tag: serializeTag(tag) });
});

export const updateTag = asyncHandler(async (req, res) => {
  const tag = await loadById(Tag, req.params.id, 'Tag');
  const next = { ...req.body };
  next.slug = next.slug !== undefined ? cleanSlug(next.slug) : tag.slug;
  await assertFree(Tag, { name: next.name, slug: next.slug }, tag._id);
  Object.assign(tag, next);
  await tag.save();
  await audit(req.user, 'tag.update', 'Tag', tag._id, { fields: Object.keys(req.body) });
  taxonomyChanged('tags');
  res.json({ tag: serializeTag(tag) });
});

async function detachTag(fromId, intoId) {
  for (const path of ['tags', 'pendingRevision.tags']) {
    if (intoId) await Post.updateMany({ [path]: fromId }, { $addToSet: { [path]: intoId } });
    await Post.updateMany({ [path]: fromId }, { $pull: { [path]: fromId } });
  }
}

export const mergeTag = asyncHandler(async (req, res) => {
  const from = await loadById(Tag, req.params.id, 'Tag');
  const into = await loadById(Tag, req.body.into, 'Target tag');
  if (from._id.equals(into._id)) throw ApiError.badRequest('Pick a different tag to merge into');
  await detachTag(from._id, into._id);
  await from.deleteOne();
  await audit(req.user, 'tag.merge', 'Tag', into._id, { from: from.name, into: into.name });
  taxonomyChanged('tags');
  res.json({ tag: serializeTag(into) });
});

export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await loadById(Tag, req.params.id, 'Tag');
  await detachTag(tag._id, null);
  await tag.deleteOne();
  await audit(req.user, 'tag.delete', 'Tag', tag._id, { name: tag.name });
  taxonomyChanged('tags');
  res.status(204).end();
});
