import { Post, POST_STATUS as S, REVISION_STATE as R } from '../../models/Post.js';
import { PlagFingerprint } from '../../models/Plagiarism.js';
import { corpusEntries, prepareArticle, uniqueShingles } from './text.js';
import { logger } from '../../utils/logger.js';

const CORPUS_FILTER = {
  deletedAt: null,
  $or: [{ status: { $in: [S.PUBLISHED, S.IN_REVIEW] } }, { 'pendingRevision.state': R.IN_REVIEW }],
};

export async function syncFingerprints(post) {
  try {
    const entries = corpusEntries(post);
    const targets = [];
    for (const entry of entries) {
      const article = prepareArticle(entry);
      targets.push(entry.target);
      await PlagFingerprint.findOneAndUpdate(
        { postId: post._id, target: entry.target },
        {
          $set: {
            contentHash: article.hash,
            wordCount: article.wordCount,
            title: entry.title,
            slug: post.slug || '',
            shingles5: uniqueShingles(article.sh5),
            shingles8: uniqueShingles(article.sh8),
          },
        },
        { upsert: true }
      );
    }
    if (targets.length) await PlagFingerprint.deleteMany({ postId: post._id, target: { $nin: targets } });
    else await PlagFingerprint.deleteMany({ postId: post._id });
  } catch (err) {
    logger.warn('plagiarism', `fingerprint sync failed: ${err.message}`);
  }
}

async function backfillMissing() {
  const posts = await Post.find(CORPUS_FILTER).select('_id status pendingRevision.state').lean();
  const expected = [];
  for (const post of posts) {
    if (post.status === S.PUBLISHED || post.status === S.IN_REVIEW) expected.push({ id: post._id, target: 'live' });
    if (post.pendingRevision?.state === R.IN_REVIEW) expected.push({ id: post._id, target: 'revision' });
  }
  const corpusIds = posts.map((post) => post._id);
  if (corpusIds.length) await PlagFingerprint.deleteMany({ postId: { $nin: corpusIds } });
  else await PlagFingerprint.deleteMany({});
  if (!expected.length) return;

  const prints = await PlagFingerprint.find({ postId: { $in: corpusIds } }).select('postId target').lean();
  const have = new Set(prints.map((print) => `${print.postId}:${print.target}`));
  const missing = [...new Set(expected.filter((item) => !have.has(`${item.id}:${item.target}`)).map((item) => String(item.id)))];
  if (!missing.length) return;
  const full = await Post.find({ _id: { $in: missing } });
  for (const post of full) await syncFingerprints(post);
}

export async function loadCorpus(excludePostId) {
  await backfillMissing();
  const prints = await PlagFingerprint.find({ postId: { $ne: excludePostId } }).lean();
  return prints.map((print) => ({
    kind: 'internal',
    postId: print.postId,
    target: print.target,
    title: print.title,
    slug: print.slug,
    hash: print.contentHash,
    sh5: print.shingles5,
    sh8: print.shingles8,
  }));
}
