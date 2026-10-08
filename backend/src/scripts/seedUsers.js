/**
 * Creates the admin and staff accounts (SEED_ADMIN_EMAIL / SEED_STAFF_EMAIL). Both sign in with email codes.
 *   npm run seed:users
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { ensureSeedAccounts } from './lib/seedAccounts.js';

async function run() {
  await connectDB();
  await ensureSeedAccounts();
}

run()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
