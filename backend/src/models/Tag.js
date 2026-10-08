import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  },
  { timestamps: true }
);
tagSchema.index({ name: 1, _id: 1 });

export const Tag = mongoose.model('Tag', tagSchema);
