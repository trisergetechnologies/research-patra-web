import mongoose from 'mongoose';

const { Schema } = mongoose;

export const COMMENT_FIELDS = ['contentHtml', 'title', 'excerpt', 'general'];
export const COMMENT_KINDS = ['must', 'suggestion'];
export const COMMENT_STATUS = Object.freeze({ DRAFT: 'draft', OPEN: 'open', RESOLVED: 'resolved' });

const replySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

// An admin's note pinned to a passage. Drafts stay private to the admin until "Request changes" sends them.
// The passage is found again by its text plus a little context on each side, so the note survives nearby edits.
const reviewCommentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    submission: { type: Schema.Types.ObjectId, ref: 'Submission', default: null },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    field: { type: String, enum: COMMENT_FIELDS, required: true },
    quote: { type: String, default: '', maxlength: 1000 },
    prefix: { type: String, default: '', maxlength: 64 },
    suffix: { type: String, default: '', maxlength: 64 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    kind: { type: String, enum: COMMENT_KINDS, default: 'must' },
    suggestion: { type: String, default: null, maxlength: 2000 },
    status: { type: String, enum: Object.values(COMMENT_STATUS), default: COMMENT_STATUS.DRAFT },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    replies: { type: [replySchema], default: [] },
    // Set when the review cycle ends (published or edits discarded); closed comments are history only.
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewCommentSchema.index({ post: 1, closedAt: 1, createdAt: 1 });

export const ReviewComment = mongoose.model('ReviewComment', reviewCommentSchema);
