const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretToken");

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.USER_NOT_FOUND,
        });
      }

      if (!req.user.isActive) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: "User account is deactivated",
        });
      }

      next();
    } catch (error) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.TOKEN_INVALID,
      });
    }
  }

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED_ACCESS,
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Protect admin routes
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretToken" );

      // Check if token is for admin
      if (decoded.type !== "admin") {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: "Invalid token type for admin access",
        });
      }

      // Get admin from the token
      req.admin = await Admin.findById(decoded.id).select("-password");

      if (!req.admin) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (!req.admin.isActive) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: "Admin account is deactivated",
        });
      }

      next();
    } catch (error) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "Invalid token",
      });
    }
  }

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

module.exports = { protect, authorize, protectAdmin };
