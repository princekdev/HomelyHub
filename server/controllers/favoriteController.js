const User = require("../models/User");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// @desc    Get logged in user's favorite properties
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "favorites",
    match: { isActive: true },
  });
  sendSuccess(res, 200, "Favorites fetched", user.favorites);
});

// @desc    Add a property to favorites
// @route   POST /api/users/favorites/:propertyId
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) throw new ApiError(404, "Property not found");

  const user = await User.findById(req.user._id);
  if (!user.favorites.some((f) => f.toString() === property._id.toString())) {
    user.favorites.push(property._id);
    await user.save();
  }

  sendSuccess(res, 200, "Added to favorites", { propertyId: property._id });
});

// @desc    Remove a property from favorites
// @route   DELETE /api/users/favorites/:propertyId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favorites = user.favorites.filter(
    (f) => f.toString() !== req.params.propertyId
  );
  await user.save();
  sendSuccess(res, 200, "Removed from favorites", { propertyId: req.params.propertyId });
});

module.exports = { getFavorites, addFavorite, removeFavorite };
