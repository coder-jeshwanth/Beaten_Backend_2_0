const { STATUS_CODES, MESSAGES } = require("../utils/constants");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: STATUS_CODES.NOT_FOUND };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: STATUS_CODES.CONFLICT };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: STATUS_CODES.BAD_REQUEST };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Token is not valid";
    error = { message, statusCode: STATUS_CODES.UNAUTHORIZED };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token has expired";
    error = { message, statusCode: STATUS_CODES.UNAUTHORIZED };
  }

  res.status(error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || MESSAGES.SERVER_ERROR,
    ...( "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
