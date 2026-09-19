const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const recalculateRating = async (propertyId) => {
  const stats = await Review.aggregate([
    { $match: { property: propertyId } },
    {
      $group: {
        _id: "$property",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const rating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewCount = stats.length ? stats[0].count : 0;

  await Property.findByIdAndUpdate(propertyId, { rating, reviewCount });
};

// @desc    Create a review (only after a completed booking)
// @route   POST /api/properties/:id/reviews
// @access  Private (user)
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, bookingId } = req.body;
  const propertyId = req.params.id;

  if (!rating || !comment || !bookingId) {
    throw new ApiError(400, "rating, comment and bookingId are required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only review your own bookings");
  }
  if (booking.property.toString() !== propertyId) {
    throw new ApiError(400, "Booking does not match this property");
  }
  if (booking.status !== "completed") {
    throw new ApiError(400, "You can only review a completed stay");
  }

  const existing = await Review.findOne({ booking: bookingId });
  if (existing) {
    throw new ApiError(409, "You have already reviewed this booking");
  }

  const review = await Review.create({
    user: req.user._id,
    property: propertyId,
    booking: bookingId,
    rating,
    comment,
  });

  await recalculateRating(propertyId);

  sendSuccess(res, 201, "Review submitted successfully", review);
});

// @desc    Get reviews for a property
// @route   GET /api/properties/:id/reviews
// @access  Public
const getPropertyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ property: req.params.id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, "Reviews fetched", reviews);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (review owner, admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to delete this review");
  }

  const propertyId = review.property;
  await review.deleteOne();
  await recalculateRating(propertyId);

  sendSuccess(res, 200, "Review deleted");
});

module.exports = { createReview, getPropertyReviews, deleteReview };
