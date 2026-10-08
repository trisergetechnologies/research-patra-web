import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/slug.js';
import { Media } from '../models/Media.js';
import { Post } from '../models/Post.js';
import { AuthorProfile } from '../models/AuthorProfile.js';

export const MAX_IMAGE_BYTES = 500 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Pixel rules per display slot. Matching the aspect ratio up front means the blog's
 * fixed-ratio frames never crop away anything important or stretch an image.
 */
export const SLOT_RULES = {
  cover: { label: 'Cover', minWidth: 1200, minHeight: 675, ratio: 16 / 9, ratioLabel: '16:9', widths: [480, 768, 1200, 1600] },
  og: { label: 'Social share', minWidth: 1200, minHeight: 630, ratio: 1.91, ratioLabel: '1.91:1', widths: [1200] },
  inline: { label: 'Inline', minWidth: 800, minHeight: 200, ratio: null, ratioLabel: 'any', widths: [640, 960, 1280] },
  avatar: { label: 'Avatar', minWidth: 256, minHeight: 256, ratio: 1, ratioLabel: '1:1', widths: [96, 192, 256] },
};
const RATIO_TOLERANCE = 0.02;

const configured = () => !!(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

if (configured()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/* ---------- upload pipeline ---------- */

export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 5 },
}).single('file');

const reject = (message) => ApiError.badRequest(message);

/** Reads the real file type from its bytes (not the client's claim) and checks the slot's pixel rules. */
export async function inspectImage(buffer, slot) {
  const rule = SLOT_RULES[slot];
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !ALLOWED_MIME.includes(type.mime)) throw reject('Only JPEG, PNG or WebP images are allowed');

  let meta;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    throw reject('This image file is damaged or unreadable');
  }
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  if (!width || !height) throw reject('Could not read the image size');

  if (width < rule.minWidth || height < rule.minHeight) {
    throw reject(`${rule.label} image must be at least ${rule.minWidth}×${rule.minHeight}px (got ${width}×${height})`);
  }
  if (rule.ratio && Math.abs(width / height - rule.ratio) / rule.ratio > RATIO_TOLERANCE) {
    throw reject(`${rule.label} image must be ${rule.ratioLabel} (got ${width}×${height})`);
  }
  if (width > 6000 || height > 6000) throw reject('Image is larger than 6000px on a side');

  return { width, height, format: type.ext === 'jpg' ? 'jpeg' : type.ext };
}

function uploadBuffer(buffer, slot) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${env.cloudinary.folder}/${slot}`, resource_type: 'image', unique_filename: true, overwrite: false },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export async function createMedia(user, file, { slot, alt }) {
  if (!file) throw reject('Choose an image to upload');
  const info = await inspectImage(file.buffer, slot);
  if (!configured()) throw new ApiError(503, 'Image uploads are not configured on the server');

  let result;
  try {
    result = await uploadBuffer(file.buffer, slot);
  } catch (err) {
    console.error('[media] Cloudinary upload failed:', err.message);
    throw new ApiError(502, 'Image host is unavailable, please try again');
  }

  return Media.create({
    publicId: result.public_id,
    slot,
    width: info.width,
    height: info.height,
    bytes: file.size,
    format: info.format,
    alt,
    originalName: String(file.originalname || '').slice(0, 200),
    uploadedBy: user._id,
  });
}

/* ---------- URLs ---------- */

/** Cloudinary delivery URL with automatic format/quality. Built locally so it never requires the API secret. */
export function mediaUrl(publicId, { w, h, crop = 'fill' } = {}) {
  if (!publicId) return null;
  const t = ['f_auto', 'q_auto', `c_${crop}`];
  if (w) t.push(`w_${w}`);
  if (h) t.push(`h_${h}`);
  return `https://res.cloudinary.com/${env.cloudinary.cloudName || 'demo'}/image/upload/${t.join(',')}/${publicId}`;
}

/** Display dimensions + srcset for a slot. Widths beyond the original are skipped so nothing is upscaled. */
export function variantsFor(media) {
  const rule = SLOT_RULES[media.slot];
  const ratio = rule.ratio;
  const widths = rule.widths.filter((w) => w <= media.width);
  if (!widths.length) widths.push(media.width);
  const heightFor = (w) => (ratio ? Math.round(w / ratio) : Math.round((w * media.height) / media.width));
  const src = (w) => mediaUrl(media.publicId, ratio ? { w, h: heightFor(w), crop: 'fill' } : { w, crop: 'limit' });

  const main = widths[widths.length - 1];
  return {
    url: src(main),
    width: main,
    height: heightFor(main),
    srcset: widths.map((w) => `${src(w)} ${w}w`).join(', '),
  };
}

export function serializeMedia(media) {
  if (!media || !media.publicId) return null;
  const v = variantsFor(media);
  return {
    id: String(media._id),
    publicId: media.publicId,
    slot: media.slot,
    alt: media.alt,
    width: media.width,
    height: media.height,
    bytes: media.bytes,
    format: media.format,
    originalName: media.originalName,
    url: v.url,
    srcset: v.srcset,
    displayWidth: v.width,
    displayHeight: v.height,
    thumbUrl: mediaUrl(media.publicId, { w: 320, h: media.slot === 'avatar' ? 320 : 200, crop: 'fill' }),
    createdAt: media.createdAt,
  };
}

/** Public shape used by blog-web: { url, alt, width, height, srcset }. */
export function publicImage(media) {
  if (!media || !media.publicId) return null;
  const v = variantsFor(media);
  return { url: v.url, alt: media.alt, width: v.width, height: v.height, srcset: v.srcset };
}

/* ---------- usage + delete ---------- */

export async function findMediaUsage(media) {
  const idRefs = ['coverImage', 'ogImage', 'pendingRevision.coverImage', 'pendingRevision.ogImage'].map((path) => ({ [path]: media._id }));
  const inHtml = new RegExp(escapeRegex(media.publicId));
  const [posts, authors] = await Promise.all([
    Post.find({ $or: [...idRefs, { contentHtml: inHtml }, { 'pendingRevision.contentHtml': inHtml }] })
      .select('title slug deletedAt')
      .limit(20)
      .lean(),
    AuthorProfile.find({ avatar: media._id }).select('displayName slug').lean(),
  ]);
  return {
    posts: posts.map((p) => ({ id: String(p._id), title: p.title, deleted: !!p.deletedAt })),
    authors: authors.map((a) => ({ id: String(a._id), name: a.displayName })),
  };
}

export async function deleteMedia(media) {
  const usage = await findMediaUsage(media);
  if (usage.posts.length || usage.authors.length) {
    const err = new ApiError(409, 'This image is still in use', usage);
    err.code = 'MEDIA_IN_USE';
    throw err;
  }
  if (configured()) {
    try {
      await cloudinary.uploader.destroy(media.publicId, { resource_type: 'image', invalidate: true });
    } catch (err) {
      console.error('[media] Cloudinary delete failed:', err.message);
      throw new ApiError(502, 'Image host is unavailable, please try again');
    }
  }
  await media.deleteOne();
}

export const mediaConfigured = configured;
