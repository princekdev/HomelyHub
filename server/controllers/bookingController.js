const Booking = require("../models/Booking");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const SERVICE_FEE_RATE = 0.05; // 5% platform service fee

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (user)
const createBooking = asyncHandler(async (req, res) => {
  const { propertyId, checkIn, checkOut, guests } = req.body;

  if (!propertyId || !checkIn || !checkOut || !guests) {
    throw new ApiError(400, "propertyId, checkIn, checkOut and guests are required");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate) || isNaN(checkOutDate)) {
    throw new ApiError(400, "Invalid check-in or check-out date");
  }
  if (checkInDate < today) {
    throw new ApiError(400, "Cannot book dates in the past");
  }
  if (checkOutDate <= checkInDate) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }

  const property = await Property.findById(propertyId);
  if (!property || !property.isActive) {
    throw new ApiError(404, "Property not found");
  }

  if (property.host.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot book your own property");
  }

  if (Number(guests) > property.guests) {
    throw new ApiError(400, `This property allows a maximum of ${property.guests} guests`);
  }

  // Backend-enforced overlap check - authoritative regardless of frontend state
  const conflict = await Booking.findOne({
    property: propertyId,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });
  if (conflict) {
    throw new ApiError(409, "These dates are no longer available for this property");
  }

  const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const pricePerNight = property.pricePerNight;
  const cleaningFee = property.cleaningFee || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const booking = await Booking.create({
    user: req.user._id,
    property: propertyId,
    host: property.host,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    nights,
    pricePerNight,
    cleaningFee,
    serviceFee,
    totalPrice,
    status: "pending",
    paymentStatus: "pending",
  });

  sendSuccess(res, 201, "Booking created successfully", booking);
});

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private (user)
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("property", "title images location pricePerNight")
    .populate("host", "name avatar")
    .sort({ checkIn: -1 });
  sendSuccess(res, 200, "Your bookings fetched", bookings);
});

// @desc    Get bookings for the logged in host's properties
// @route   GET /api/bookings/host
// @access  Private (host)
const getHostBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ host: req.user._id })
    .populate("property", "title images location")
    .populate("user", "name avatar email")
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, "Host bookings fetched", bookings);
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (booking owner, host, admin)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("property")
    .populate("user", "name avatar email")
    .populate("host", "name avatar email");

  if (!booking) throw new ApiError(404, "Booking not found");

  const isGuest = booking.user._id.toString() === req.user._id.toString();
  const isHost = booking.host._id.toString() === req.user._id.toString();
  if (!isGuest && !isHost && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to view this booking");
  }

  sendSuccess(res, 200, "Booking fetched", booking);
});

// @desc    Update booking status (confirm/reject by host, cancel by user, complete by admin/system)
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["confirmed", "rejected", "cancelled", "completed"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");

  const isGuest = booking.user.toString() === req.user._id.toString();
  const isHost = booking.host.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (status === "confirmed" || status === "rejected") {
    if (!isHost && !isAdmin) {
      throw new ApiError(403, "Only the host can confirm or reject this booking");
    }
    if (booking.status !== "pending") {
      throw new ApiError(400, `Cannot ${status === "confirmed" ? "confirm" : "reject"} a booking that is not pending`);
    }
  }

  if (status === "cancelled") {
    if (!isGuest && !isAdmin) {
      throw new ApiError(403, "Only the guest can cancel this booking");
    }
    if (!["pending", "confirmed"].includes(booking.status)) {
      throw new ApiError(400, "This booking cannot be cancelled");
    }
  }

  if (status === "completed") {
    if (!isAdmin && !isHost) {
      throw new ApiError(403, "Only the host or admin can mark a booking as completed");
    }
    if (booking.status !== "confirmed") {
      throw new ApiError(400, "Only confirmed bookings can be marked as completed");
    }
  }

  booking.status = status;
  await booking.save();

  sendSuccess(res, 200, `Booking ${status} successfully`, booking);
});

// @desc    Delete/cancel a booking record entirely (kept minimal - prefer status update)
// @route   DELETE /api/bookings/:id
// @access  Private (owner, admin)
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");

  const isGuest = booking.user.toString() === req.user._id.toString();
  if (!isGuest && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to delete this booking");
  }

  await booking.deleteOne();
  sendSuccess(res, 200, "Booking removed");
});

module.exports = {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};
