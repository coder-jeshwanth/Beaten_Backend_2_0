// HTTP Status Codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Response Messages
const MESSAGES = {
  USER_REGISTERED: "User registered successfully",
  USER_LOGGED_IN: "User logged in successfully",
  USER_LOGGED_OUT: "User logged out successfully",
  USER_PROFILE_RETRIEVED: "User profile retrieved successfully",
  USER_UPDATED: "User updated successfully",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  EMAIL_EXISTS: "Email already exists",
  UNAUTHORIZED_ACCESS: "Not authorized to access this route",
  TOKEN_INVALID: "Token is not valid",
  TOKEN_EXPIRED: "Token has expired",
  VALIDATION_ERROR: "Validation error",
  SERVER_ERROR: "Internal server error",
};

// User Roles
const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

module.exports = {
  STATUS_CODES,
  MESSAGES,
  ROLES,
};
