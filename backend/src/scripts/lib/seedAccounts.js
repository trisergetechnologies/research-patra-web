import { env } from '../../config/env.js';
import { User } from '../../models/User.js';
import { ROLES } from '../../config/roles.js';
import { ensureAuthorProfile, publishExistingProfile } from '../../services/author.service.js';

/** Creates or re-activates the seeded admin and staff accounts. Returns { admin, staff } users. */
export async function ensureSeedAccounts() {
  const specs = {
    admin: { email: env.seedAdminEmail, name: env.seedAdminName, role: ROLES.ADMIN },
    staff: { email: env.seedStaffEmail, name: env.seedStaffName, role: ROLES.STAFF },
  };

  const result = {};
  for (const [key, spec] of Object.entries(specs)) {
    let user = await User.findOne({ email: spec.email });
    if (user) {
      const changed = user.role !== spec.role || !user.isActive;
      user.role = spec.role;
      user.isActive = true;
      if (changed) user.tokenVersion += 1;
      await user.save();
      console.log(`Kept ${key} ${spec.email}`);
    } else {
      user = await User.create(spec);
      console.log(`Created ${key} ${spec.email}`);
    }
    const profile = await ensureAuthorProfile(user);
    await publishExistingProfile(profile);
    result[key] = user;
  }
  return result;
}
