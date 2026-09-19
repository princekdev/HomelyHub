const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { deleteReview } = require("../controllers/reviewController");

router.delete("/:id", protect, deleteReview);

module.exports = router;
