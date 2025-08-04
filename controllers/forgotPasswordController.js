const User = require("../models/User");
const Admin = require("../models/Admin");
const {
  generateOTP,
  generateResetToken,
  sendOTPEmail,
  sendPasswordResetSuccessEmail,
} = require("../utils/emailService");
const crypto = require("crypto");

// In-memory storage for OTP (in production, use Redis or database)
const otpStorage = new Map();

// Store OTP with expiration
const storeOTP = (email, otp, userType) => {
  const key = `${userType}_${email}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStorage.set(key, { otp, expiresAt });

  // Clean up expired OTPs
  setTimeout(
    () => {
      otpStorage.delete(key);
    },
    10 * 60 * 1000
  );
};

// Get OTP from storage
const getOTP = (email, userType) => {
  const key = `${userType}_${email}`;
  const data = otpStorage.get(key);

  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    otpStorage.delete(key);
    return null;
  }

  return data.otp;
};

// Remove OTP from storage
const removeOTP = (email, userType) => {
  const key = `${userType}_${email}`;
  otpStorage.delete(key);
};

// Send forgot password OTP for users
const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email address",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP
    storeOTP(email, otp, "user");

    // Send email
    await sendOTPEmail(email, otp, "user");

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Error in sendForgotPasswordOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

// Send forgot password OTP for admins
const sendAdminForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found with this email address",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP
    storeOTP(email, otp, "admin");

    // Send email
    await sendOTPEmail(email, otp, "admin");

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Error in sendAdminForgotPasswordOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

// Verify OTP for users
const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email address",
      });
    }

    // Verify OTP
    const storedOTP = getOTP(email, "user");
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();

    // Remove OTP from storage
    removeOTP(email, "user");

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Error in verifyForgotPasswordOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};

// Verify OTP for admins
const verifyAdminForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found with this email address",
      });
    }

    // Verify OTP
    const storedOTP = getOTP(email, "admin");
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update admin with reset token
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpire = resetTokenExpiry;
    await admin.save();

    // Remove OTP from storage
    removeOTP(email, "admin");

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Error in verifyAdminForgotPasswordOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};

// Reset password for users
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email address",
      });
    }

    // Check reset token and expiry
    if (
      !user.resetPasswordToken ||
      !user.resetPasswordExpire ||
      user.resetPasswordToken !== resetToken ||
      user.resetPasswordExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send success email
    await sendPasswordResetSuccessEmail(email, "user");

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
};

// Reset password for admins
const resetAdminPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Admin password must be at least 8 characters long",
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found with this email address",
      });
    }

    // Check reset token and expiry
    if (
      !admin.resetPasswordToken ||
      !admin.resetPasswordExpire ||
      admin.resetPasswordToken !== resetToken ||
      admin.resetPasswordExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    // Send success email
    await sendPasswordResetSuccessEmail(email, "admin");

    res.status(200).json({
      success: true,
      message: "Admin password reset successfully",
    });
  } catch (error) {
    console.error("Error in resetAdminPassword:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
};

module.exports = {
  sendForgotPasswordOTP,
  sendAdminForgotPasswordOTP,
  verifyForgotPasswordOTP,
  verifyAdminForgotPasswordOTP,
  resetPassword,
  resetAdminPassword,
};
