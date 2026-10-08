import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err?.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', fields: Object.keys(err.keyValue || {}) });
  }
  if (err?.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }
  if (err?.name === 'VersionError') {
    return res.status(409).json({ message: 'This post was changed by someone else. Reload to get the latest version.', code: 'VERSION_CONFLICT' });
  }
  if (err?.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 500 KB or smaller' : err.message;
    return res.status(400).json({ message });
  }

  const status = err instanceof ApiError ? err.status : 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && env.isProd ? 'Internal server error' : err.message,
    ...(err instanceof ApiError && err.code ? { code: err.code } : {}),
    ...(err.details ? { details: err.details } : {}),
  });
}
