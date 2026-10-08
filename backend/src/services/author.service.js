import { AuthorProfile } from '../models/AuthorProfile.js';
import { slugify, uniqueSlug } from '../utils/slug.js';

/** Every writer gets a public author profile the first time they need one. */
export async function ensureAuthorProfile(user) {
  const existing = await AuthorProfile.findOne({ user: user._id });
  if (existing) return existing;

  const slug = await uniqueSlug(slugify(user.name.replace(/^Dr\.?\s*/i, '')), (s) => AuthorProfile.exists({ slug: s }));
  try {
    return await AuthorProfile.create({ user: user._id, slug, displayName: user.name });
  } catch (err) {
    // Two first requests at once: the other one created it.
    if (err.code === 11000) return AuthorProfile.findOne({ user: user._id });
    throw err;
  }
}
