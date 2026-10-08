import mongoose from 'mongoose';
import { Media, MEDIA_SLOTS } from '../models/Media.js';
import { ROLES } from '../config/roles.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/slug.js';
import { cursorPage } from '../utils/cursor.js';
import { audit } from '../services/audit.service.js';
import {
  MAX_IMAGE_BYTES,
  SLOT_RULES,
  createMedia,
  deleteMedia,
  findMediaUsage,
  mediaConfigured,
  serializeMedia,
} from '../services/media.service.js';

const canManage = (user, media) => user.role === ROLES.ADMIN || media.uploadedBy.equals(user._id);

async function load(req) {
  const media = mongoose.isValidObjectId(req.params.id) ? await Media.findById(req.params.id) : null;
  if (!media) throw ApiError.notFound('Image not found');
  return media;
}

export const getMediaRules = (req, res) => {
  res.json({
    maxBytes: MAX_IMAGE_BYTES,
    types: ['image/jpeg', 'image/png', 'image/webp'],
    configured: mediaConfigured(),
    slots: Object.fromEntries(
      Object.entries(SLOT_RULES).map(([slot, r]) => [
        slot,
        { label: r.label, minWidth: r.minWidth, minHeight: r.minHeight, ratio: r.ratio, ratioLabel: r.ratioLabel },
      ])
    ),
  });
};

/** Shared library: everyone can browse and reuse images; only the uploader or an admin can change them. */
export const listMedia = asyncHandler(async (req, res) => {
  const page = cursorPage(req.query, { field: 'createdAt', dir: -1 }, { def: 24, max: 60 });
  const filter = {};
  if (MEDIA_SLOTS.includes(req.query.slot)) filter.slot = req.query.slot;
  if (req.query.mine === 'true') filter.uploadedBy = req.user._id;
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ alt: rx }, { originalName: rx }];
  }

  const [rows, total] = await Promise.all([
    Media.find({ $and: [filter, page.filter] }).sort(page.sort).limit(page.limit + 1).populate('uploadedBy', 'name'),
    req.query.cursor ? null : Media.countDocuments(filter),
  ]);
  const { items, nextCursor } = page.finish(rows);
  res.json({
    media: items.map((m) => ({
      ...serializeMedia(m),
      uploadedBy: m.uploadedBy?.name ?? null,
      canManage: canManage(req.user, { uploadedBy: m.uploadedBy?._id ?? m.uploadedBy }),
    })),
    nextCursor,
    ...(total === null ? {} : { total }),
  });
});

export const uploadMedia = asyncHandler(async (req, res) => {
  const media = await createMedia(req.user, req.file, req.body);
  await audit(req.user, 'media.upload', 'Media', media._id, { slot: media.slot, bytes: media.bytes });
  res.status(201).json({ media: { ...serializeMedia(media), canManage: true } });
});

export const updateMedia = asyncHandler(async (req, res) => {
  const media = await load(req);
  if (!canManage(req.user, media)) throw ApiError.forbidden('Only the uploader or an admin can edit this image');
  media.alt = req.body.alt;
  await media.save();
  res.json({ media: { ...serializeMedia(media), canManage: true } });
});

export const getMediaUsage = asyncHandler(async (req, res) => {
  res.json({ usage: await findMediaUsage(await load(req)) });
});

export const removeMedia = asyncHandler(async (req, res) => {
  const media = await load(req);
  if (!canManage(req.user, media)) throw ApiError.forbidden('Only the uploader or an admin can delete this image');
  await deleteMedia(media);
  await audit(req.user, 'media.delete', 'Media', media._id, { publicId: media.publicId });
  res.status(204).end();
});
