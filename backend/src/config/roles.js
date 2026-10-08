export const ROLES = Object.freeze({
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
});

export const ALL_ROLES = Object.values(ROLES);

// Roles allowed to sign in. Customer stays dormant until its features exist.
export const LOGIN_ROLES = [ROLES.ADMIN, ROLES.STAFF];
