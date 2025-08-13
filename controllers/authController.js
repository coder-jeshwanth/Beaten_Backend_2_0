const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const {
  generateOTP,
  sendOTPEmail,
  sendAdminRegistrationNotification,
} = require("../utils/emailService");
const jwt = require("jsonwebtoken");

// In-memory OTP storage for login (reuse pattern)
const otpLoginStorage = new Map();
const storeOtpLogin = (key, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpLoginStorage.set(key, { otp, expiresAt });
  setTimeout(() => otpLoginStorage.delete(key), 10 * 60 * 1000);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    
    const { name, email, password, gender, dob, phone } = req.body;
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: MESSAGES.EMAIL_EXISTS,
      });
    }

    

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      gender: gender || "",
      dob: dob || "",
      phone: phone || "",
    });

    if (user) {
      // Send admin notification for new registration
      await sendAdminRegistrationNotification({
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        userGender: user.gender,
        userDob: user.dob,
      });

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.USER_REGISTERED,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          dob: user.dob,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  

    // // Success
    //  res.json({
    //   success: true,
    //   message: "User logged in successfully",
    //   data: {
    //     _id: user._id,
    //     name: user.name,
    //     email: user.email,
    //     role: user.role,
    //     token: generateToken(user._id),
    //   },
    // });
    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: "User logged in successfully",
      data: {
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          dob: user.dob,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const sendOtpLogin = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Email or phone is required" });
    }
    let user = null;
    let key = null;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      key = `email_${email.toLowerCase()}`;
    } else if (phone) {
      user = await User.findOne({ phone });
      key = `phone_${phone}`;
    }
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid details. User not found." });
    }
    const otp = generateOTP();
    storeOtpLogin(key, otp);
    if (email) {
      await sendOTPEmail(email, otp, "user", "login");
      return res
        .status(200)
        .json({ success: true, message: "OTP sent to your email." });
    } else if (phone) {
      // TODO: Integrate with Firebase for phone OTP
      return res.status(200).json({
        success: true,
        message: "OTP sent to your phone (not implemented).",
      });
    }
  } catch (error) {
    console.error("Error in sendOtpLogin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

const verifyOtpLogin = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    if ((!email && !phone) || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email or phone and OTP are required",
      });
    }
    let user = null;
    let key = null;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      key = `email_${email.toLowerCase()}`;
    } else if (phone) {
      user = await User.findOne({ phone });
      key = `phone_${phone}`;
    }
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid details. User not found." });
    }
    const stored = otpLoginStorage.get(key);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
    // OTP is valid, remove it
    otpLoginStorage.delete(key);
    // Generate JWT token (reuse generateToken)
    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      message: "OTP verified. Login successful.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in verifyOtpLogin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.USER_PROFILE_RETRIEVED,
      data: {
        _id: user._id,
        user: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Check if email is being updated and if it already exists
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(STATUS_CODES.CONFLICT).json({
          success: false,
          message: MESSAGES.EMAIL_EXISTS,
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        email: email || req.user.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.USER_UPDATED,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.USER_LOGGED_OUT,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
};
module.exports.sendOtpLogin = sendOtpLogin;
module.exports.verifyOtpLogin = verifyOtpLogin;
