import { z } from 'zod';
import { MEDIA_SLOTS } from '../models/Media.js';
import { COMMENT_FIELDS, COMMENT_KINDS } from '../models/ReviewComment.js';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const version = z.number().int().min(0);
const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a hex colour like #EA580C');
const slug = z.string().trim().min(1).max(120);
const optionalUrl = z.union([z.literal(''), z.string().trim().url().max(300)]);

const seo = z
  .object({
    metaTitle: z.string().trim().max(70).default(''),
    metaDescription: z.string().trim().max(170).default(''),
    canonical: optionalUrl.default(''),
    noindex: z.boolean().default(false),
  })
  .strict();

const postFields = {
  title: z.string().trim().min(1, 'Title is required').max(160),
  excerpt: z.string().trim().max(320),
  contentHtml: z.string().max(400_000, 'Content is too long'),
  keyTakeaways: z.array(z.string().trim().min(1).max(200)).max(8),
  coverImage: objectId.nullable(),
  ogImage: objectId.nullable(),
  category: objectId.nullable(),
  tags: z.array(objectId).max(10, 'Up to 10 tags'),
  seo,
  series: z.string().trim().max(80),
  seriesOrder: z.number().int().min(1).max(99).nullable(),
  slug,
  featured: z.boolean(),
  author: objectId,
  reviewedBy: objectId.nullable(),
};

const { title, ...optionalFields } = postFields;

export const createPostSchema = z
  .object({ title, ...Object.fromEntries(Object.entries(optionalFields).map(([k, v]) => [k, v.optional()])) })
  .strict();

export const updatePostSchema = z
  .object({
    ...Object.fromEntries(Object.entries(postFields).map(([k, v]) => [k, v.optional()])),
    target: z.enum(['live', 'revision']).optional(),
    version,
  })
  .strict();

export const postActionSchema = z.object({ version }).strict();
export const requestChangesSchema = z.object({ version, note: z.string().trim().max(1000).default('') }).strict();

const commentBody = z.string().trim().min(1, 'Write a comment').max(2000);
const suggestion = z.string().max(2000).nullable();
export const createCommentSchema = z
  .object({
    field: z.enum(COMMENT_FIELDS),
    quote: z.string().max(1000).default(''),
    prefix: z.string().max(64).default(''),
    suffix: z.string().max(64).default(''),
    body: commentBody,
    kind: z.enum(COMMENT_KINDS).default('must'),
    suggestion: suggestion.default(null),
  })
  .strict();
export const updateCommentSchema = z
  .object({ body: commentBody, kind: z.enum(COMMENT_KINDS), suggestion, status: z.enum(['open', 'resolved']) })
  .partial()
  .strict();
export const replySchema = z.object({ body: commentBody }).strict();

export const categorySchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    slug: slug.max(60).optional(),
    description: z.string().trim().max(300).default(''),
    color: z.object({ from: hex, to: hex }).strict().optional(),
  })
  .strict();
export const updateCategorySchema = categorySchema.partial().strict();

export const tagSchema = z.object({ name: z.string().trim().min(1).max(40), slug: slug.max(40).optional() }).strict();
export const updateTagSchema = tagSchema.partial().strict();
export const mergeTagSchema = z.object({ into: objectId }).strict();

const authorFields = {
  displayName: z.string().trim().min(1).max(100),
  roleTitle: z.string().trim().max(80),
  bio: z.string().trim().max(600),
  avatar: objectId.nullable(),
  credentials: z.string().trim().max(160),
  expertise: z.array(z.string().trim().min(1).max(40)).max(6, 'Up to 6 areas'),
  links: z
    .object({ website: optionalUrl, linkedin: optionalUrl, orcid: optionalUrl, scholar: optionalUrl })
    .partial()
    .strict(),
};
export const updateMyAuthorSchema = z.object(authorFields).partial().strict();
export const adminUpdateAuthorSchema = z
  .object({ ...authorFields, slug: slug.max(80) })
  .partial()
  .strict();
export const rejectAuthorSchema = z.object({ note: z.string().trim().min(1, 'Add a short note for the author').max(500) }).strict();

// Multipart text fields arrive as strings.
export const uploadMediaSchema = z.object({
  slot: z.enum(MEDIA_SLOTS),
  alt: z.string().trim().min(1, 'Describe the image for screen readers').max(200),
});
export const updateMediaSchema = z.object({ alt: z.string().trim().min(1).max(200) }).strict();
