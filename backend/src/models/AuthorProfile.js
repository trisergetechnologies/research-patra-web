import mongoose from 'mongoose';

const authorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    displayName: { type: String, required: true, trim: true, maxlength: 100 },
    roleTitle: { type: String, trim: true, maxlength: 100, default: '' },
    bio: { type: String, trim: true, maxlength: 600, default: '' },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    // Shown to readers as proof of expertise, e.g. "PhD, Public Health · 10 years supervising theses".
    credentials: { type: String, trim: true, maxlength: 160, default: '' },
    expertise: { type: [String], default: [] },
    links: {
      website: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      orcid: { type: String, trim: true, default: '' },
      scholar: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

export const AuthorProfile = mongoose.model('AuthorProfile', authorProfileSchema);
