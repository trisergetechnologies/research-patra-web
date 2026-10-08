/**
 * Brings MongoDB indexes in line with the models (creates new ones, drops ones no longer defined)
 * and fills derived fields on existing posts. Safe to run repeatedly; run after deploys that change models.
 *   npm run sync:indexes
 */
import { readdir } from 'node:fs/promises';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Post, POST_STATUS, REVISION_STATE } from '../models/Post.js';

async function run() {
  const dir = new URL('../models/', import.meta.url);
  for (const file of await readdir(dir)) if (file.endsWith('.js')) await import(new URL(file, dir).href);
  await connectDB();

  const queued = await Post.updateMany({}, [
    {
      $set: {
        queuedAt: {
          $switch: {
            branches: [
              { case: { $eq: ['$pendingRevision.state', REVISION_STATE.IN_REVIEW] }, then: { $ifNull: ['$pendingRevision.submittedAt', '$updatedAt'] } },
              { case: { $eq: ['$status', POST_STATUS.IN_REVIEW] }, then: { $ifNull: ['$submittedAt', '$updatedAt'] } },
            ],
            default: null,
          },
        },
      },
    },
  ], { timestamps: false, updatePipeline: true });
  console.log(`queuedAt refreshed on ${queued.modifiedCount} post(s)`);

  for (const model of Object.values(mongoose.models)) {
    const dropped = await model.syncIndexes();
    console.log(`${model.modelName}: indexes in sync${dropped.length ? ` (dropped ${dropped.join(', ')})` : ''}`);
  }
}

run()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
