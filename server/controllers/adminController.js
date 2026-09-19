const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// @desc    Platform-wide stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalHosts, totalProperties, totalBookings, revenueAgg] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "host" }),
      Property.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $in: ["confirmed", "completed"] } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

  const totalRevenue = revenueAgg.length ? revenueAgg[0].total : 0;

  sendSuccess(res, 200, "Platform stats fetched", {
    totalUsers,
    totalHosts,
    totalProperties,
    totalBookings,
    totalRevenue,
  });
});

// @desc    List all users (optionally filter by role)
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, 200, "Users fetched", users);
});

// @desc    Block or unblock a user
// @route   PATCH /api/admin/users/:id/status
// @access  Private (admin)
const setUserBlockedStatus = asyncHandler(async (req, res) => {
  const { isBlocked } = req.body;
  if (typeof isBlocked !== "boolean") {
    throw new ApiError(400, "isBlocked must be a boolean");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") {
    throw new ApiError(400, "Cannot block another admin");
  }

  user.isBlocked = isBlocked;
  await user.save();

  sendSuccess(res, 200, `User ${isBlocked ? "blocked" : "unblocked"} successfully`, user.toSafeObject());
});

// @desc    Change a user's role (user/host/admin) - the ONLY way roles change
// @route   PATCH /api/admin/users/:id/role
// @access  Private (admin)
const setUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ["user", "host", "admin"];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, "Role must be one of: user, host, admin");
  }

  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.role = role;
  await user.save();

  sendSuccess(res, 200, `User role updated to ${role}`, user.toSafeObject());
});

// @desc    List all properties (admin view, includes inactive)
// @route   GET /api/admin/properties
// @access  Private (admin)
const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({})
    .populate("host", "name email")
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, "Properties fetched", properties);
});

// @desc    Remove/deactivate a property (moderation)
// @route   DELETE /api/admin/properties/:id
// @access  Private (admin)
const removeProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");
  await property.deleteOne();
  sendSuccess(res, 200, "Property removed by admin");
});

// @desc    List all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private (admin)
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("property", "title")
    .populate("user", "name email")
    .populate("host", "name email")
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, "Bookings fetched", bookings);
});

module.exports = {
  getStats,
  getUsers,
  setUserBlockedStatus,
  setUserRole,
  getAllProperties,
  removeProperty,
  getAllBookings,
};
