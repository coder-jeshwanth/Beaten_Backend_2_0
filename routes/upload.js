const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const os = require("os");
const { uploadImage } = require("../controllers/uploadController");

// Multer config (store in OS temp dir for Cloudinary upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// POST /api/upload/image
router.post("/image", upload.single("image"), uploadImage);

module.exports = router;
