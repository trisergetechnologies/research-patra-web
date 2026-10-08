import { asyncHandler } from '../utils/ApiError.js';

export const getMe = (req, res) => {
  res.json({ user: req.user.toPublic() });
};

export const updateMe = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});
