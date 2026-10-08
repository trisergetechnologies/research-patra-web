import mongoose from 'mongoose';

export const MEDIA_SLOTS = ['cover', 'og', 'inline', 'avatar'];

const mediaSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true },
    slot: { type: String, enum: MEDIA_SLOTS, required: true, index: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    bytes: { type: Number, required: true },
    format: { type: String, required: true },
    alt: { type: String, required: true, trim: true, maxlength: 200 },
    originalName: { type: String, trim: true, maxlength: 200 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

mediaSchema.index({ createdAt: -1, _id: -1 });

export const Media = mongoose.model('Media', mediaSchema);
