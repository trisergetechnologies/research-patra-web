import mongoose from 'mongoose';

const { Schema } = mongoose;

// What the writer sent for review, frozen at submit time. Lets the reviewer see only what changed since their last look.
const submissionSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    revision: { type: Boolean, default: false },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: Schema.Types.Mixed, required: true },
    at: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
  },
  { versionKey: false }
);

submissionSchema.index({ post: 1, closedAt: 1, at: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);
