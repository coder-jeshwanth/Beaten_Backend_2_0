const cloudinary = require("../utils/cloudinary");

// POST /api/upload/image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "beaten-products",
      resource_type: "image",
    });
    return res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadImage };
