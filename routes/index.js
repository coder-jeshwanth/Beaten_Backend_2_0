const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth");
const productRoutes = require("./products");
const adminRoutes = require("./admin");
const userRoutes = require("./user");
const dataEntryRoutes = require("./dataEntry");
const reviewRoutes = require("./reviews");

const orderRoutes = require("./orders");
const addressRoutes = require("./address");
const forgotPasswordRoutes = require("./forgotPassword");
const emailRoutes = require("./email");
const footerInfoRoutes = require("./footerInfo");

// Route definitions
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", require("./upload"));
router.use("/user", userRoutes);
router.use(require("./coupons"));
router.use("/data-entry", dataEntryRoutes);
router.use("/reviews", reviewRoutes);

router.use("/orders", orderRoutes);
router.use("/user/addresses", addressRoutes);
router.use("/forgot-password", forgotPasswordRoutes);
router.use("/email", emailRoutes);
router.use("/footer-info", footerInfoRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Beaten API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
