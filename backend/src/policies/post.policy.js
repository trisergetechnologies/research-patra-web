import { ROLES } from '../config/roles.js';
import { POST_STATUS as S, REVISION_STATE as R } from '../models/Post.js';

const isAdmin = (user) => user.role === ROLES.ADMIN;
const isOwner = (user, post) => String(post.createdBy?._id ?? post.createdBy) === String(user._id);
const revisionState = (post) => post.pendingRevision?.state ?? null;

/**
 * Every permission decision for posts lives here. Controllers call `can(user, action, post)`;
 * the UI receives the same answers through `permissionsFor()` so buttons match what the API allows.
 */
const RULES = {
  view: (u, p) => isAdmin(u) || isOwner(u, p),

  // Where edits go: 'live' (the post itself) or 'revision' (pending changes to a published post). null = not editable.
  editTarget: (u, p) => {
    if (p.deletedAt) return null;
    if (isAdmin(u)) return p.pendingRevision ? 'revision' : 'live';
    if (!isOwner(u, p)) return null;
    if ([S.DRAFT, S.CHANGES_REQUESTED].includes(p.status)) return 'live';
    if (p.status === S.PUBLISHED && revisionState(p) !== R.IN_REVIEW) return 'revision';
    return null;
  },

  edit: (u, p) => RULES.editTarget(u, p) !== null,

  // Slugs of published posts are permanent for staff; admins can rename (the old slug redirects).
  changeSlug: (u, p) => isAdmin(u) || (isOwner(u, p) && !p.publishedAt),
  changeAuthor: (u) => isAdmin(u),
  feature: (u, p) => isAdmin(u) && !p.deletedAt,

  submit: (u, p) => {
    if (isAdmin(u) || !isOwner(u, p) || p.deletedAt) return false;
    if ([S.DRAFT, S.CHANGES_REQUESTED].includes(p.status)) return true;
    return p.status === S.PUBLISHED && [R.DRAFT, R.CHANGES_REQUESTED].includes(revisionState(p));
  },

  // Admin publishes: a staff submission, their own draft, an archived post, or a pending revision.
  approve: (u, p) => {
    if (!isAdmin(u) || p.deletedAt) return false;
    if (p.status === S.PUBLISHED) return !!p.pendingRevision;
    return true;
  },

  requestChanges: (u, p) =>
    isAdmin(u) && !p.deletedAt && (p.status === S.IN_REVIEW || revisionState(p) === R.IN_REVIEW),

  discardRevision: (u, p) =>
    !!p.pendingRevision && !p.deletedAt && (isAdmin(u) || (isOwner(u, p) && revisionState(p) !== R.IN_REVIEW)),

  unpublish: (u, p) => isAdmin(u) && p.status === S.PUBLISHED && !p.deletedAt,
  archive: (u, p) => isAdmin(u) && p.status !== S.ARCHIVED && !p.deletedAt,
  restore: (u, p) => isAdmin(u) && (!!p.deletedAt || p.status === S.ARCHIVED),

  // Staff may only delete their own work that has never been live.
  delete: (u, p) => {
    if (p.deletedAt) return false;
    if (isAdmin(u)) return true;
    return isOwner(u, p) && !p.publishedAt && [S.DRAFT, S.CHANGES_REQUESTED].includes(p.status);
  },

  viewAudit: (u, p) => isAdmin(u) || isOwner(u, p),
};

export function can(user, action, post) {
  const rule = RULES[action];
  if (!rule) throw new Error(`Unknown post action: ${action}`);
  return !!rule(user, post);
}

export const editTarget = (user, post) => RULES.editTarget(user, post);

export function permissionsFor(user, post) {
  return {
    edit: can(user, 'edit', post),
    editTarget: editTarget(user, post),
    changeSlug: can(user, 'changeSlug', post),
    changeAuthor: can(user, 'changeAuthor', post),
    feature: can(user, 'feature', post),
    submit: can(user, 'submit', post),
    approve: can(user, 'approve', post),
    requestChanges: can(user, 'requestChanges', post),
    discardRevision: can(user, 'discardRevision', post),
    unpublish: can(user, 'unpublish', post),
    archive: can(user, 'archive', post),
    restore: can(user, 'restore', post),
    delete: can(user, 'delete', post),
  };
}

/** Mongo filter limiting a post list to what the user may see. */
export const visibilityFilter = (user) => (isAdmin(user) ? {} : { createdBy: user._id });
