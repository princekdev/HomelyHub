const Property = require("../models/Property");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// @desc    Get properties with search, filter, sort, pagination
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const {
    location,
    q,
    minPrice,
    maxPrice,
    propertyType,
    guests,
    bedrooms,
    amenities,
    sort,
    page = 1,
    limit = 12,
    host,
  } = req.query;

  const filter = { isActive: true };

  if (location) {
    filter["location.city"] = { $regex: location, $options: "i" };
  }
  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }
  if (minPrice || maxPrice) {
    filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
  }
  if (propertyType) {
    filter.propertyType = { $in: propertyType.split(",") };
  }
  if (guests) {
    filter.guests = { $gte: Number(guests) };
  }
  if (bedrooms) {
    filter.bedrooms = { $gte: Number(bedrooms) };
  }
  if (amenities) {
    filter.amenities = { $all: amenities.split(",") };
  }
  if (host) {
    filter.host = host;
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { pricePerNight: 1 };
  if (sort === "price_desc") sortOption = { pricePerNight: -1 };
  if (sort === "rating") sortOption = { rating: -1 };
  if (sort === "newest") sortOption = { createdAt: -1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("host", "name avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Property.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Properties fetched", properties, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
});

// @desc    Get single property by id
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    "host",
    "name avatar email createdAt"
  );
  if (!property) throw new ApiError(404, "Property not found");
  sendSuccess(res, 200, "Property fetched", property);
});

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (host, admin)
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    propertyType,
    pricePerNight,
    cleaningFee,
    address,
    city,
    state,
    country,
    postalCode,
    guests,
    bedrooms,
    beds,
    bathrooms,
    amenities,
  } = req.body;

  if (!title || !description || !propertyType || !pricePerNight) {
    throw new ApiError(400, "Missing required property fields");
  }
  if (!address || !city || !state) {
    throw new ApiError(400, "Address, city and state are required");
  }
  if (Number(pricePerNight) <= 0) {
    throw new ApiError(400, "Price per night must be greater than 0");
  }

  const images = (req.files || []).map((f) => ({
    url: f.path,
    publicId: f.filename,
  }));
  if (images.length === 0) {
    throw new ApiError(400, "Please upload at least one property image");
  }

  let amenitiesArr = amenities;
  if (typeof amenities === "string") {
    amenitiesArr = amenities.split(",").map((a) => a.trim());
  }

  const created = await Property.create({
    title,
    description,
    propertyType,
    pricePerNight,
    cleaningFee: cleaningFee || 0,
    location: { address, city, state, country: country || "India", postalCode },
    guests,
    bedrooms,
    beds,
    bathrooms,
    amenities: amenitiesArr || [],
    images,
    host: req.user._id,
  });

  // Populate host so the frontend receives the same shape as getPropertyById
  const property = await Property.findById(created._id).populate("host", "name avatar email createdAt");

  sendSuccess(res, 201, "Property created successfully", property);
});

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (owning host, admin)
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");

  const isOwner = property.host.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to edit this property");
  }

  const editableFields = [
    "title",
    "description",
    "propertyType",
    "pricePerNight",
    "cleaningFee",
    "guests",
    "bedrooms",
    "beds",
    "bathrooms",
    "isActive",
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) property[field] = req.body[field];
  });

  if (req.body.address || req.body.city || req.body.state || req.body.country || req.body.postalCode) {
    property.location = {
      address: req.body.address || property.location.address,
      city: req.body.city || property.location.city,
      state: req.body.state || property.location.state,
      country: req.body.country || property.location.country,
      postalCode: req.body.postalCode || property.location.postalCode,
    };
  }

  if (req.body.amenities !== undefined) {
    property.amenities =
      typeof req.body.amenities === "string"
        ? req.body.amenities.split(",").map((a) => a.trim())
        : req.body.amenities;
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    property.images = [...property.images, ...newImages];
  }

  await property.save();
  sendSuccess(res, 200, "Property updated successfully", property);
});

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (owning host, admin)
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");

  const isOwner = property.host.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to delete this property");
  }

  await property.deleteOne();
  sendSuccess(res, 200, "Property deleted successfully");
});

// @desc    Remove one image from a property
// @route   DELETE /api/properties/:id/images/:imagePublicId
// @access  Private (owning host, admin)
const removePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");

  const isOwner = property.host.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to edit this property");
  }

  if (property.images.length <= 1) {
    throw new ApiError(400, "A property must have at least one image");
  }

  property.images = property.images.filter(
    (img) => img.publicId !== req.params.imagePublicId
  );
  await property.save();
  sendSuccess(res, 200, "Image removed", property);
});

// @desc    Get properties owned by the logged in host
// @route   GET /api/properties/host/mine
// @access  Private (host)
const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ host: req.user._id }).sort({
    createdAt: -1,
  });
  sendSuccess(res, 200, "Your properties fetched", properties);
});

// @desc    Check availability for a date range
// @route   GET /api/properties/:id/availability?checkIn=&checkOut=
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    throw new ApiError(400, "checkIn and checkOut dates are required");
  }
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const conflict = await Booking.findOne({
    property: req.params.id,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  sendSuccess(res, 200, "Availability checked", { available: !conflict });
});

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  removePropertyImage,
  getMyProperties,
  checkAvailability,
};
