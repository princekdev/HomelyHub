const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const {
  register,
  login,
  logout,
  getMe,
  updateMe,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/me", protect, uploadAvatar.single("avatar"), updateMe);
// Note: no self-service "become a host" route. Roles are changed only by an
// admin - see PATCH /api/admin/users/:id/role in adminRoutes.js.

module.exports = router;
