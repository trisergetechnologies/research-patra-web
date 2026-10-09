import { AuthorProfile, AUTHOR_STATUS } from '../models/AuthorProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify, uniqueSlug } from '../utils/slug.js';

export const AUTHOR_MSG = Object.freeze({
  notApproved: 'Your author profile is not approved, so this article cannot be sent for review.',
  removedPublish: 'This author profile is removed. Restore and approve it before publishing this article.',
  removedProfile:
    'This author profile is removed. Drafts are still yours to edit or delete. An admin must restore it and approve it before an article can be sent for review.',
  alreadyRemoved: 'This author profile is already removed.',
  restoreFirst: 'This author profile is removed. Restore it before approving.',
});

const linkCopy = (links) => ({
  website: links?.website || '',
  linkedin: links?.linkedin || '',
  orcid: links?.orcid || '',
  scholar: links?.scholar || '',
});

const refId = (value) => {
  if (!value) return null;
  return String(value._id ?? value);
};

/** Fields readers are allowed to see, copied from the working profile. */
export function publicSnapshot(profile) {
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    roleTitle: profile.roleTitle || '',
    bio: profile.bio || '',
    avatar: profile.avatar?._id ?? profile.avatar ?? null,
    credentials: profile.credentials || '',
    expertise: [...(profile.expertise || [])],
    links: linkCopy(profile.links),
  };
}

function snapshotsMatch(profile) {
  const published = profile.published;
  if (!published?.displayName) return false;
  const next = publicSnapshot(profile);
  return (
    next.slug === (published.slug || '') &&
    next.displayName === published.displayName &&
    next.roleTitle === (published.roleTitle || '') &&
    next.bio === (published.bio || '') &&
    refId(next.avatar) === refId(published.avatar) &&
    next.credentials === (published.credentials || '') &&
    JSON.stringify(next.expertise) === JSON.stringify(published.expertise || []) &&
    JSON.stringify(next.links) === JSON.stringify(linkCopy(published.links))
  );
}

/** Profiles saved before this workflow have no status. Treat them as already approved until the backfill runs. */
export function isLegacyProfile(profile) {
  return !!profile && profile.status == null && !profile.published?.displayName && !profile.deletedAt;
}

/** True when this byline may go out for review or onto the public site. */
export function isArticleEligible(profile) {
  if (!profile || profile.deletedAt) return false;
  if (profile.eligible) return true;
  return isLegacyProfile(profile);
}

/** The public author page is on only while an approval is in force. */
export function isPublicAuthor(profile) {
  return isArticleEligible(profile) && !!(profile.published?.slug || isLegacyProfile(profile));
}

/**
 * Why an article cannot be submitted or published, or null when it can.
 * Submit always uses the not-approved sentence. Publish names a removed profile.
 */
export function articleBlockReason(profile, { publishing = false } = {}) {
  if (isArticleEligible(profile)) return null;
  if (publishing && profile?.deletedAt) return AUTHOR_MSG.removedPublish;
  return AUTHOR_MSG.notApproved;
}

/** A private draft, created when someone writes a post before saving a profile. Not on the site. */
export async function ensureAuthorProfile(user) {
  const existing = await AuthorProfile.findOne({ user: user._id });
  if (existing) return existing;

  const slug = await uniqueSlug(slugify(user.name.replace(/^Dr\.?\s*/i, '')) || 'author', (s) => AuthorProfile.exists({ slug: s }));
  try {
    return await AuthorProfile.create({
      user: user._id,
      slug,
      displayName: user.name,
      status: AUTHOR_STATUS.DRAFT,
      eligible: false,
    });
  } catch (err) {
    if (err.code === 11000) return AuthorProfile.findOne({ user: user._id });
    throw err;
  }
}

/** Unsaved draft used by the first Save, so a failed save does not leave a row behind. */
export async function blankAuthorProfile(user, displayName) {
  const name = (displayName || user.name || 'Author').trim();
  const slug = await uniqueSlug(slugify(name.replace(/^Dr\.?\s*/i, '')) || 'author', (s) => AuthorProfile.exists({ slug: s }));
  return new AuthorProfile({
    user: user._id,
    slug,
    displayName: name,
    status: AUTHOR_STATUS.DRAFT,
    eligible: false,
  });
}

/** Editing an approved profile keeps the live page up and sends the working copy back to draft. */
export function syncStatusAfterEdit(profile) {
  if (profile.deletedAt) return;
  if (snapshotsMatch(profile)) {
    profile.status = AUTHOR_STATUS.APPROVED;
    return;
  }
  if (profile.status !== AUTHOR_STATUS.DRAFT) profile.status = AUTHOR_STATUS.DRAFT;
}

export function submitProfile(profile) {
  if (profile.deletedAt) throw ApiError.badRequest(AUTHOR_MSG.removedProfile);
  if (!profile.displayName?.trim()) throw ApiError.badRequest('Add a display name before sending this profile for approval.');
  if (profile.status === AUTHOR_STATUS.IN_REVIEW) throw ApiError.badRequest('This profile is already with an admin for approval.');
  if (profile.status === AUTHOR_STATUS.APPROVED && snapshotsMatch(profile)) {
    throw ApiError.badRequest('This profile is already approved. Edit it first if you want to send changes.');
  }
  profile.status = AUTHOR_STATUS.IN_REVIEW;
  profile.reviewNote = '';
}

export async function approveProfile(profile) {
  if (profile.deletedAt) throw ApiError.badRequest(AUTHOR_MSG.restoreFirst);
  if (!profile.displayName?.trim()) throw ApiError.badRequest('Add a display name before approving this profile.');
  const clash = await AuthorProfile.exists({
    _id: { $ne: profile._id },
    deletedAt: null,
    eligible: true,
    'published.slug': profile.slug,
  });
  if (clash) throw ApiError.badRequest('Validation failed', [{ path: 'slug', message: 'Another author already uses this URL' }]);
  profile.published = publicSnapshot(profile);
  profile.status = AUTHOR_STATUS.APPROVED;
  profile.eligible = true;
  profile.reviewNote = '';
}

export function rejectProfile(profile, note) {
  if (profile.deletedAt) throw ApiError.badRequest(AUTHOR_MSG.removedProfile);
  if (profile.status !== AUTHOR_STATUS.IN_REVIEW) throw ApiError.badRequest('This profile is not waiting for approval.');
  profile.status = AUTHOR_STATUS.DRAFT;
  profile.reviewNote = note;
}

export function removeProfile(profile) {
  if (profile.deletedAt) throw ApiError.badRequest(AUTHOR_MSG.alreadyRemoved);
  profile.deletedAt = new Date();
  profile.eligible = false;
}

export function restoreProfile(profile) {
  if (!profile.deletedAt) throw ApiError.badRequest('This author profile is not removed.');
  profile.deletedAt = null;
  profile.status = AUTHOR_STATUS.DRAFT;
  profile.eligible = false;
  profile.reviewNote = '';
}

/** Seed and legacy rows that were already on the site stay approved. New profiles never call this. */
export async function publishExistingProfile(profile) {
  if (!profile || profile.published?.displayName || profile.deletedAt) return profile;
  profile.status = AUTHOR_STATUS.APPROVED;
  profile.eligible = true;
  profile.reviewNote = '';
  profile.published = publicSnapshot(profile);
  await profile.save();
  return profile;
}

/** Safe to run more than once. Only profiles from before this workflow are changed. */
export async function backfillAuthorApprovals() {
  const profiles = await AuthorProfile.find({ status: { $exists: false } });
  for (const profile of profiles) {
    profile.status = AUTHOR_STATUS.APPROVED;
    profile.eligible = true;
    profile.reviewNote = '';
    profile.published = publicSnapshot(profile);
    await profile.save();
  }
  return profiles.length;
}

const LIVE_AUTHOR = { deletedAt: null, eligible: true };

/** Public author page lookup. Legacy rows (no status yet) still resolve by their current slug. */
export async function findPublicAuthor(slug) {
  if (!slug) return null;
  const published = await AuthorProfile.findOne({ ...LIVE_AUTHOR, 'published.slug': slug }).populate('published.avatar').populate('avatar');
  if (published) return published;
  return AuthorProfile.findOne({ deletedAt: null, status: { $exists: false }, slug }).populate('avatar');
}
