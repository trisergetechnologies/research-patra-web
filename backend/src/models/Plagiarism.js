import mongoose from 'mongoose';

const { Schema } = mongoose;

const SCAN_STATUSES = ['queued', 'running', 'complete', 'incomplete', 'failed'];
const VERDICTS = ['clear', 'review', 'strong', 'incomplete'];
const TARGETS = ['live', 'revision'];

const plagScanSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    target: { type: String, enum: TARGETS, required: true },
    contentHash: { type: String, required: true },
    status: { type: String, enum: SCAN_STATUSES, default: 'queued' },
    verdict: { type: String, enum: [null, ...VERDICTS], default: null },
    requeues: { type: Number, default: 0 },
    failureReason: { type: String, default: '' },
    snapshot: {
      title: { type: String, default: '' },
      contentHtml: { type: String, default: '' },
      keyTakeaways: { type: [String], default: [] },
    },
    report: { type: Schema.Types.Mixed, default: null },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

plagScanSchema.index({ status: 1, createdAt: 1 });
plagScanSchema.index({ postId: 1, createdAt: -1 });
plagScanSchema.index({ postId: 1, contentHash: 1, status: 1 });

const plagFingerprintSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    target: { type: String, enum: TARGETS, required: true },
    contentHash: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    shingles5: { type: [Number], default: [] },
    shingles8: { type: [Number], default: [] },
  },
  { timestamps: true }
);

plagFingerprintSchema.index({ postId: 1, target: 1 }, { unique: true });

const plagPageSchema = new Schema(
  {
    url: { type: String, required: true, unique: true },
    host: { type: String, default: '' },
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const plagBudgetSchema = new Schema(
  {
    day: { type: String, required: true, unique: true },
    fetchCount: { type: Number, default: 0 },
  },
  { timestamps: false }
);

const plagSearchCacheSchema = new Schema(
  {
    queryHash: { type: String, required: true, unique: true },
    query: { type: String, default: '' },
    results: { type: Schema.Types.Mixed, default: [] },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const plagMonthQuotaSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    checkCount: { type: Number, default: 0 },
  },
  { timestamps: false }
);

plagMonthQuotaSchema.index({ userId: 1, month: 1 }, { unique: true });

export const PlagScan = mongoose.model('PlagScan', plagScanSchema);
export const PlagFingerprint = mongoose.model('PlagFingerprint', plagFingerprintSchema);
export const PlagPage = mongoose.model('PlagPage', plagPageSchema);
export const PlagBudget = mongoose.model('PlagBudget', plagBudgetSchema);
export const PlagSearchCache = mongoose.model('PlagSearchCache', plagSearchCacheSchema);
export const PlagMonthQuota = mongoose.model('PlagMonthQuota', plagMonthQuotaSchema);
