import { User } from '../models/User.js';
import { ALL_ROLES } from '../config/roles.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { revokeAllForUser } from '../services/token.service.js';
import { cursorPage } from '../utils/cursor.js';

export const listUsers = asyncHandler(async (req, res) => {
  const page = cursorPage(req.query, { field: 'createdAt', dir: -1 });
  const filter = {};
  if (ALL_ROLES.includes(req.query.role)) filter.role = req.query.role;
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const q = req.query.q.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  }

  const [rows, total] = await Promise.all([
    User.find({ $and: [filter, page.filter] }).sort(page.sort).limit(page.limit + 1),
    req.query.cursor ? null : User.countDocuments(filter),
  ]);
  const { items, nextCursor } = page.finish(rows);

  res.json({ users: items.map((u) => u.toPublic()), nextCursor, ...(total === null ? {} : { total }) });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict('Email already in use');

  const user = await User.create({ name, email, role });

  res.status(201).json({ user: user.toPublic() });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const isSelf = user._id.equals(req.user._id);
  if (isSelf && (req.body.role !== undefined || req.body.isActive !== undefined)) {
    throw ApiError.badRequest('You cannot change your own role or status');
  }

  const accessChanged =
    (req.body.role !== undefined && req.body.role !== user.role) ||
    (req.body.isActive !== undefined && req.body.isActive !== user.isActive);

  Object.assign(user, req.body);
  if (accessChanged) user.tokenVersion += 1;
  await user.save();
  if (accessChanged) await revokeAllForUser(user._id);

  res.json({ user: user.toPublic() });
});
