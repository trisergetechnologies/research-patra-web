import mongoose from 'mongoose';

const loginCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

loginCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const LoginCode = mongoose.model('LoginCode', loginCodeSchema);
