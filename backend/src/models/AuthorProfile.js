import mongoose from 'mongoose';

const { Schema } = mongoose;

export const AUTHOR_STATUS = Object.freeze({
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
});
export const AUTHOR_STATUSES = Object.values(AUTHOR_STATUS);

const linksSchema = new Schema(
  {
    website: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    orcid: { type: String, trim: true, default: '' },
    scholar: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

// Last copy an admin approved. The website reads this, never the working fields above it.
const publishedSchema = new Schema(
  {
    slug: { type: String, lowercase: true, trim: true, default: '' },
    displayName: { type: String, trim: true, maxlength: 100, default: '' },
    roleTitle: { type: String, trim: true, maxlength: 100, default: '' },
    bio: { type: String, trim: true, maxlength: 600, default: '' },
    avatar: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    credentials: { type: String, trim: true, maxlength: 160, default: '' },
    expertise: { type: [String], default: [] },
    links: { type: linksSchema, default: () => ({}) },
  },
  { _id: false }
);

const authorProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    displayName: { type: String, required: true, trim: true, maxlength: 100 },
    roleTitle: { type: String, trim: true, maxlength: 100, default: '' },
    bio: { type: String, trim: true, maxlength: 600, default: '' },
    avatar: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    // Shown to readers as proof of expertise, e.g. "PhD, Public Health · 10 years supervising theses".
    credentials: { type: String, trim: true, maxlength: 160, default: '' },
    expertise: { type: [String], default: [] },
    links: { type: linksSchema, default: () => ({}) },
    status: { type: String, enum: AUTHOR_STATUSES, index: true },
    reviewNote: { type: String, trim: true, maxlength: 500, default: '' },
    deletedAt: { type: Date, default: null },
    // Articles can be sent for review only while this is true. Soft delete turns it off.
    // No schema default: profiles from before this workflow have neither field, and a default
    // would mark them as drafts the next time they are saved.
    eligible: { type: Boolean },
    published: { type: publishedSchema, default: null },
  },
  { timestamps: true }
);

authorProfileSchema.index({ 'published.slug': 1 });

export const AuthorProfile = mongoose.model('AuthorProfile', authorProfileSchema);
