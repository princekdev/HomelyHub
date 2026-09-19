const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

// Verifies JWT (from httpOnly cookie or Authorization header) and attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired session. Please log in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    // Clear the stale cookie so the browser stops re-sending it
    res.clearCookie("token");
    throw new ApiError(401, "User no longer exists.");
  }
  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked. Contact support.");
  }

  req.user = user;
  next();
});

// Restricts access to specific roles. Usage: authorize("host", "admin")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }
  next();
};

// Attaches req.user if a valid token is present, but does not require it.
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isBlocked) req.user = user;
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
