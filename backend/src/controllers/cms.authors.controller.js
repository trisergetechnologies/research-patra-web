import mongoose from 'mongoose';
import { AuthorProfile } from '../models/AuthorProfile.js';
import { Media } from '../models/Media.js';
import { Post } from '../models/Post.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { slugify } from '../utils/slug.js';
import { ensureAuthorProfile } from '../services/author.service.js';
import { audit } from '../services/audit.service.js';
import { revalidateBlog } from '../services/revalidate.service.js';
import { serializeAuthor } from '../services/cms.serialize.js';

async function applyChanges(profile, body) {
  if (body.avatar !== undefined && body.avatar !== null) {
    const media = await Media.findById(body.avatar).select('slot');
    if (!media) throw ApiError.badRequest('Validation failed', [{ path: 'avatar', message: 'Image not found' }]);
    if (media.slot !== 'avatar') throw ApiError.badRequest('Validation failed', [{ path: 'avatar', message: 'Pick an avatar image' }]);
  }
  if (body.slug !== undefined) {
    const slug = slugify(body.slug);
    if (!slug) throw ApiError.badRequest('Validation failed', [{ path: 'slug', message: 'Slug is invalid' }]);
    if (await AuthorProfile.exists({ _id: { $ne: profile._id }, slug })) {
      throw ApiError.badRequest('Validation failed', [{ path: 'slug', message: 'Another author already uses this URL' }]);
    }
    body = { ...body, slug };
  }
  if (body.expertise) {
    const seen = new Set();
    body = { ...body, expertise: body.expertise.filter((t) => !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase())) };
  }
  if (body.links) body = { ...body, links: { ...profile.links?.toObject?.(), ...body.links } };
  const oldSlug = profile.slug;
  Object.assign(profile, body);
  await profile.save();
  revalidateBlog({ tags: ['authors', 'posts'] });
  return oldSlug;
}

const populated = (id) => AuthorProfile.findById(id).populate('avatar');

export const getMyAuthor = asyncHandler(async (req, res) => {
  const profile = await ensureAuthorProfile(req.user);
  res.json({ author: serializeAuthor(await populated(profile._id)) });
});

export const updateMyAuthor = asyncHandler(async (req, res) => {
  const profile = await ensureAuthorProfile(req.user);
  await applyChanges(profile, req.body);
  await audit(req.user, 'author.update', 'AuthorProfile', profile._id, { fields: Object.keys(req.body) });
  res.json({ author: serializeAuthor(await populated(profile._id)) });
});

export const listAuthors = asyncHandler(async (req, res) => {
  const [profiles, counts] = await Promise.all([
    AuthorProfile.find().sort({ displayName: 1 }).populate('avatar').populate('user', 'email role isActive'),
    Post.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: '$author', n: { $sum: 1 } } }]),
  ]);
  const byAuthor = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({
    authors: profiles.map((p) => ({
      ...serializeAuthor(p),
      email: p.user?.email ?? null,
      role: p.user?.role ?? null,
      active: p.user?.isActive ?? false,
      posts: byAuthor.get(String(p._id)) ?? 0,
    })),
  });
});

export const updateAuthor = asyncHandler(async (req, res) => {
  const profile = mongoose.isValidObjectId(req.params.id) ? await AuthorProfile.findById(req.params.id) : null;
  if (!profile) throw ApiError.notFound('Author not found');
  const oldSlug = await applyChanges(profile, req.body);
  await audit(req.user, 'author.update', 'AuthorProfile', profile._id, { fields: Object.keys(req.body), oldSlug });
  res.json({ author: serializeAuthor(await populated(profile._id)) });
});
