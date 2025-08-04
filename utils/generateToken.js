const jwt = require("jsonwebtoken");

const generateToken = (id, type = "user") => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET || "secretToken", {
    expiresIn: process.env.JWT_EXPIRE || "3d",
  });
};

module.exports = generateToken;
