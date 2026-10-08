import { ApiError } from '../utils/ApiError.js';

// Must run after `authenticate`. Role is read from the database user, not the token.
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'));
  next();
};
