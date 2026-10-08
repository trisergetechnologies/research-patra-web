import mongoose from 'mongoose';

const { Schema } = mongoose;

export const POST_STATUS = Object.freeze({
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  CHANGES_REQUESTED: 'changes_requested',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});
export const POST_STATUSES = Object.values(POST_STATUS);

export const REVISION_STATE = Object.freeze({
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  CHANGES_REQUESTED: 'changes_requested',
});

const seoSchema = new Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 70, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 170, default: '' },
    canonical: { type: String, trim: true, default: '' },
    noindex: { type: Boolean, default: false },
  },
  { _id: false }
);

// Fields an editor can change. Shared by the live post and a pending revision.
const contentFields = {
  title: { type: String, trim: true, maxlength: 160 },
  excerpt: { type: String, trim: true, maxlength: 320, default: '' },
  contentHtml: { type: String, default: '' },
  keyTakeaways: { type: [String], default: [] },
  coverImage: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
  ogImage: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
  category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  seo: { type: seoSchema, default: () => ({}) },
  // Posts sharing a series name are shown together as "Part n of N", ordered by seriesOrder.
  series: { type: String, trim: true, maxlength: 80, default: '' },
  seriesOrder: { type: Number, min: 1, max: 99, default: null },
};
export const CONTENT_KEYS = Object.keys(contentFields);

// Staff edits to an already-published post wait here until an admin approves them, so the live article never changes unreviewed.
const revisionSchema = new Schema(
  {
    ...contentFields,
    state: { type: String, enum: Object.values(REVISION_STATE), default: REVISION_STATE.DRAFT },
    reviewNote: { type: String, default: '' },
    submittedAt: Date,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, timestamps: true }
);

const postSchema = new Schema(
  {
    ...contentFields,
    title: { ...contentFields.title, required: true },
    slug: { type: String, required: true, lowercase: true, trim: true, maxlength: 120 },
    slugHistory: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: 'AuthorProfile', required: true },
    // Subject expert who checked the article; set by admins, shown as "Reviewed by".
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'AuthorProfile', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    status: { type: String, enum: POST_STATUSES, default: POST_STATUS.DRAFT },
    reviewNote: { type: String, default: '' },
    submittedAt: Date,
    publishedAt: Date,
    // Last time the live article text changed (not views, featuring or other bookkeeping). Readers see it as "Updated".
    contentUpdatedAt: { type: Date, default: null },
    pendingRevision: { type: revisionSchema, default: null },

    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0, min: 0 },
    helpful: {
      yes: { type: Number, default: 0, min: 0 },
      no: { type: Number, default: 0, min: 0 },
    },
    readingTime: { type: Number, default: 1, min: 1 },
    deletedAt: { type: Date, default: null },
    // When this post (or its pending edits) entered review; null when nothing is waiting. Kept in sync below.
    queuedAt: { type: Date, default: null },
  },
  // `version` increments on every save and is part of the save filter, so a stale save throws VersionError (mapped to 409).
  { timestamps: true, versionKey: 'version', optimisticConcurrency: true }
);

export const reviewQueuedAt = (p) =>
  p.pendingRevision?.state === REVISION_STATE.IN_REVIEW
    ? p.pendingRevision.submittedAt || new Date()
    : p.status === POST_STATUS.IN_REVIEW
      ? p.submittedAt || new Date()
      : null;

postSchema.pre('validate', function syncQueuedAt() {
  this.queuedAt = reviewQueuedAt(this);
});

postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ slugHistory: 1 });
// Public listings (newest first, optionally by category / tag / author).
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ category: 1, status: 1, publishedAt: -1 });
postSchema.index({ tags: 1, status: 1, publishedAt: -1 });
postSchema.index({ author: 1, status: 1, publishedAt: -1 });
postSchema.index({ featured: 1, status: 1 });
postSchema.index({ status: 1, views: -1 });
postSchema.index({ series: 1, status: 1, seriesOrder: 1 });
// CMS lists.
postSchema.index({ deletedAt: 1, updatedAt: -1, _id: -1 });
postSchema.index({ createdBy: 1, deletedAt: 1, updatedAt: -1 });
postSchema.index({ queuedAt: 1, _id: 1 });
postSchema.index({ title: 'text', excerpt: 'text' }, { weights: { title: 5, excerpt: 2 }, name: 'post_text' });

export const Post = mongoose.model('Post', postSchema);
