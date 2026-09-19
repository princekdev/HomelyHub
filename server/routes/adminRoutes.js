const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getStats,
  getUsers,
  setUserBlockedStatus,
  setUserRole,
  getAllProperties,
  removeProperty,
  getAllBookings,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/status", setUserBlockedStatus);
router.patch("/users/:id/role", setUserRole);
router.get("/properties", getAllProperties);
router.delete("/properties/:id", removeProperty);
router.get("/bookings", getAllBookings);

module.exports = router;
