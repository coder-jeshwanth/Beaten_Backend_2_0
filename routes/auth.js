const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  sendOtpLogin,
  verifyOtpLogin,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
} = require("../middleware/validation");

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Add OTP login route
router.post("/send-otp-login", sendOtpLogin);
router.post("/verify-otp-login", verifyOtpLogin);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, profileUpdateValidation, updateProfile);
router.post("/logout", protect, logout);

module.exports = router;
