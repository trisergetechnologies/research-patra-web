import mongoose from 'mongoose';

export const SUBSCRIBER_STATUS = Object.freeze({ PENDING: 'pending', ACTIVE: 'active', UNSUBSCRIBED: 'unsubscribed' });

// Newsletter list with double opt-in: nobody is mailed until they click the confirmation link.
// One token per subscriber (hashed) serves both the confirm link and the unsubscribe link.
const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    status: { type: String, enum: Object.values(SUBSCRIBER_STATUS), default: SUBSCRIBER_STATUS.PENDING },
    tokenHash: { type: String, required: true, index: true },
    source: { type: String, trim: true, maxlength: 80, default: '' },
    confirmSentAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

subscriberSchema.index({ status: 1, createdAt: -1 });

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);
