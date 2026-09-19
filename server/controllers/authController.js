const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { generateToken, setTokenCookie } = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    throw new ApiError(400, "Please provide name, email, password and confirmPassword");
  }
  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // Role is never taken from the client - always defaults to "user".
  // Becoming a host happens via a separate, authenticated action.
  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  sendSuccess(res, 201, "Registration successful", {
    user: user.toSafeObject(),
    token,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked. Contact support.");
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  sendSuccess(res, 200, "Login successful", {
    user: user.toSafeObject(),
    token,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  sendSuccess(res, 200, "Logged out successfully");
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Current user fetched", { user: req.user.toSafeObject() });
});

// @desc    Update current user's profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const updates = {};
  if (name) updates.name = name;

  if (req.file) {
    updates.avatar = { url: req.file.path, publicId: req.file.filename };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, "Profile updated", { user: user.toSafeObject() });
});

// Note: there is intentionally no self-service "become a host" endpoint.
// Every account is created with role "user" (see register() above) and role
// changes (user -> host -> admin) are only ever made by an administrator,
// either directly in the database or via the Admin > Users panel
// (PATCH /api/admin/users/:id/role). This keeps role assignment fully
// backend/admin-controlled and never trusts client-provided role data.

module.exports = { register, login, logout, getMe, updateMe };
