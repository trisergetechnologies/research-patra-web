import mongoose from 'mongoose';
import { AuthorProfile } from '../models/AuthorProfile.js';
import { Media } from '../models/Media.js';
import { Post } from '../models/Post.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { slugify } from '../utils/slug.js';
import {
  AUTHOR_MSG,
  approveProfile,
  blankAuthorProfile,
  rejectProfile,
  removeProfile,
  restoreProfile,
  submitProfile,
  syncStatusAfterEdit,
} from '../services/author.service.js';
import { audit } from '../services/audit.service.js';
import { revalidateBlog } from '../services/revalidate.service.js';
import { serializeAuthor } from '../services/cms.serialize.js';

function touchPublic() {
  revalidateBlog({ tags: ['authors', 'posts'] });
}

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
  syncStatusAfterEdit(profile);
  await profile.save();
  return oldSlug;
}

const populated = (id) => AuthorProfile.findById(id).populate('avatar');

async function loadAuthor(id) {
  const profile = mongoose.isValidObjectId(id) ? await AuthorProfile.findById(id) : null;
  if (!profile) throw ApiError.notFound('Author not found');
  return profile;
}

const respond = async (res, profile) => {
  res.json({ author: serializeAuthor(await populated(profile._id)) });
};

export const getMyAuthor = asyncHandler(async (req, res) => {
  const profile = await AuthorProfile.findOne({ user: req.user._id });
  if (!profile) return res.json({ author: null });
  res.json({ author: serializeAuthor(await populated(profile._id)) });
});

export const updateMyAuthor = asyncHandler(async (req, res) => {
  let profile = await AuthorProfile.findOne({ user: req.user._id });
  if (profile?.deletedAt) throw ApiError.badRequest(AUTHOR_MSG.removedProfile);
  if (!profile) profile = await blankAuthorProfile(req.user, req.body.displayName);
  await applyChanges(profile, req.body);
  await audit(req.user, 'author.update', 'AuthorProfile', profile._id, { fields: Object.keys(req.body) });
  await respond(res, profile);
});

export const submitMyAuthor = asyncHandler(async (req, res) => {
  const profile = await AuthorProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.badRequest("You don't have an author profile yet. Fill it in and send it for approval.");
  submitProfile(profile);
  await profile.save();
  await audit(req.user, 'author.submit', 'AuthorProfile', profile._id);
  await respond(res, profile);
});

export const removeMyAuthor = asyncHandler(async (req, res) => {
  const profile = await AuthorProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.badRequest("You don't have an author profile yet. Fill it in and send it for approval.");
  removeProfile(profile);
  await profile.save();
  await audit(req.user, 'author.remove', 'AuthorProfile', profile._id);
  touchPublic();
  await respond(res, profile);
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
  const profile = await loadAuthor(req.params.id);
  const oldSlug = await applyChanges(profile, req.body);
  await audit(req.user, 'author.update', 'AuthorProfile', profile._id, { fields: Object.keys(req.body), oldSlug });
  await respond(res, profile);
});

export const approveAuthor = asyncHandler(async (req, res) => {
  const profile = await loadAuthor(req.params.id);
  await approveProfile(profile);
  await profile.save();
  await audit(req.user, 'author.approve', 'AuthorProfile', profile._id);
  touchPublic();
  await respond(res, profile);
});

export const rejectAuthor = asyncHandler(async (req, res) => {
  const profile = await loadAuthor(req.params.id);
  rejectProfile(profile, req.body.note);
  await profile.save();
  await audit(req.user, 'author.reject', 'AuthorProfile', profile._id, { note: req.body.note });
  await respond(res, profile);
});

export const removeAuthor = asyncHandler(async (req, res) => {
  const profile = await loadAuthor(req.params.id);
  removeProfile(profile);
  await profile.save();
  await audit(req.user, 'author.remove', 'AuthorProfile', profile._id);
  touchPublic();
  await respond(res, profile);
});

export const restoreAuthor = asyncHandler(async (req, res) => {
  const profile = await loadAuthor(req.params.id);
  restoreProfile(profile);
  await profile.save();
  await audit(req.user, 'author.restore', 'AuthorProfile', profile._id);
  touchPublic();
  await respond(res, profile);
});
