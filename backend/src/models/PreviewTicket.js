import mongoose from 'mongoose';

const previewTicketSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    target: { type: String, enum: ['live', 'revision'], default: 'revision' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

previewTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PreviewTicket = mongoose.model('PreviewTicket', previewTicketSchema);
