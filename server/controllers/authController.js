const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error('All fields are required'); }
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('Email already registered'); }
  const user = await User.create({ name, email, password, isVerified: true });
  res.status(201).json({ success: true, user, token: generateToken(user._id) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Email and password required'); }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) { res.status(401); throw new Error('Invalid email or password'); }
  const match = await user.matchPassword(password);
  if (!match) { res.status(401); throw new Error('Invalid email or password'); }
  user.lastLogin = new Date();
  await user.save();
  res.json({ success: true, user, token: generateToken(user._id) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images slug');
  res.json({ success: true, user });
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  if (req.body.avatar) user.avatar = req.body.avatar;
  if (req.body.password) {
    if (req.body.password.length < 6) { res.status(400); throw new Error('Password must be at least 6 characters'); }
    user.password = req.body.password;
  }
  const updated = await user.save();
  res.json({ success: true, user: updated, token: generateToken(updated._id) });
});

// POST /api/auth/address
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// DELETE /api/auth/address/:id
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// POST /api/auth/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.findIndex((id) => id.toString() === pid);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(pid);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

// Google OAuth callback handler
const googleCallback = asyncHandler(async (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
});

module.exports = { register, login, getMe, updateProfile, addAddress, deleteAddress, toggleWishlist, googleCallback };
