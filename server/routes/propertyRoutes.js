const express = require("express");
const router = express.Router();
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const { uploadPropertyImages } = require("../middleware/upload");
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  removePropertyImage,
  getMyProperties,
  checkAvailability,
} = require("../controllers/propertyController");
const { createReview, getPropertyReviews } = require("../controllers/reviewController");

// Specific routes before dynamic :id routes
router.get("/host/mine", protect, authorize("host", "admin"), getMyProperties);

router.get("/", optionalAuth, getProperties);
router.post(
  "/",
  protect,
  authorize("host", "admin"),
  uploadPropertyImages.array("images", 10),
  createProperty
);

router.get("/:id", getPropertyById);
router.put(
  "/:id",
  protect,
  authorize("host", "admin"),
  uploadPropertyImages.array("images", 10),
  updateProperty
);
router.delete("/:id", protect, authorize("host", "admin"), deleteProperty);
router.delete(
  "/:id/images/:imagePublicId",
  protect,
  authorize("host", "admin"),
  removePropertyImage
);
router.get("/:id/availability", checkAvailability);

// Reviews nested under a property
router.get("/:id/reviews", getPropertyReviews);
router.post("/:id/reviews", protect, createReview);

module.exports = router;
