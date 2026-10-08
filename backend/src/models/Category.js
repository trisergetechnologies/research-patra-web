import mongoose from 'mongoose';

const hex = { type: String, match: /^#[0-9a-fA-F]{6}$/ };

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60, unique: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    color: {
      from: { ...hex, default: '#EA580C' },
      to: { ...hex, default: '#7C2D12' },
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
