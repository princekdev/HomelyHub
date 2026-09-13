const mongoose = require("mongoose");

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Cottage",
  "Studio",
  "Hotel",
  "Resort",
  "Guest House",
];

const AMENITIES = [
  "WiFi",
  "Parking",
  "Kitchen",
  "AC",
  "TV",
  "Washing Machine",
  "Pool",
  "Workspace",
  "Security",
];

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 3000,
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: [true, "Property type is required"],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
      },
    ],
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: "India" },
      postalCode: { type: String, default: "" },
    },
    guests: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, required: true, min: 0 },
    beds: { type: Number, required: true, min: 1 },
    bathrooms: { type: Number, required: true, min: 0 },
    amenities: [
      {
        type: String,
        enum: AMENITIES,
      },
    ],
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.index({ "location.city": "text", title: "text" });
propertySchema.index({ pricePerNight: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ host: 1 });

propertySchema.statics.PROPERTY_TYPES = PROPERTY_TYPES;
propertySchema.statics.AMENITIES = AMENITIES;

module.exports = mongoose.model("Property", propertySchema);
