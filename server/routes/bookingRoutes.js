const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");

router.use(protect);

router.post("/", createBooking);
router.get("/my", getMyBookings);
router.get("/host", authorize("host", "admin"), getHostBookings);
router.get("/:id", getBookingById);
router.patch("/:id/status", updateBookingStatus);
router.delete("/:id", deleteBooking);

module.exports = router;
