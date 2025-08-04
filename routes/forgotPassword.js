const express = require("express");
const router = express.Router();
const {
  sendForgotPasswordOTP,
  sendAdminForgotPasswordOTP,
  verifyForgotPasswordOTP,
  verifyAdminForgotPasswordOTP,
  resetPassword,
  resetAdminPassword,
} = require("../controllers/forgotPasswordController");
const { body } = require("express-validator");

// Validation middleware
const validateEmail = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
];

const validateOTP = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

const validatePasswordReset = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("resetToken")
    .isLength({ min: 10 })
    .withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const validateAdminPasswordReset = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("resetToken")
    .isLength({ min: 10 })
    .withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Admin password must be at least 8 characters long"),
];

// User forgot password routes
router.post("/user/send-otp", validateEmail, sendForgotPasswordOTP);
router.post("/user/verify-otp", validateOTP, verifyForgotPasswordOTP);
router.post("/user/reset-password", validatePasswordReset, resetPassword);

// Admin forgot password routes
router.post("/admin/send-otp", validateEmail, sendAdminForgotPasswordOTP);
router.post("/admin/verify-otp", validateOTP, verifyAdminForgotPasswordOTP);
router.post(
  "/admin/reset-password",
  validateAdminPasswordReset,
  resetAdminPassword
);

module.exports = router;
