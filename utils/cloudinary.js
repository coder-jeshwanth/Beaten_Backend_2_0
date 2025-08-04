const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "di9lv1bgh",
  api_key: process.env.CLOUDINARY_API_KEY || "985964537451538",
  api_secret: process.env.CLOUDINARY_API_SECRET || "n4UJCl03aOQ7e26VncVbKwAAUCI",
});

module.exports = cloudinary;
