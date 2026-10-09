/**
 * Marks author profiles created before the approval workflow as already approved.
 * Safe to run more than once. New profiles are left alone.
 *   npm run backfill:authors
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { backfillAuthorApprovals } from '../services/author.service.js';

async function run() {
  await connectDB();
  const count = await backfillAuthorApprovals();
  console.log(`Approved ${count} existing author profile(s)`);
}

run()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
