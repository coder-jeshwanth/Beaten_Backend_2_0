const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  dashboardAnalytics,
  realTimeOrders,
  realTimeSales,
  subscriptionAnalytics,
  cachedAnalytics,
  getAllSubscriptions, // <-- add import
  sendSubscriptionReminder,
  sendBulkSubscriptionReminder,
  sendBulkMessageToSubscribers,
  addMemberToSubscription,
} = require("../controllers/adminController");
const User = require("../models/User");
const { protectAdmin } = require("../middleware/auth");
const {
  adminRegisterValidation,
  adminLoginValidation,
  adminProfileUpdateValidation,
  adminPasswordChangeValidation,
} = require("../middleware/validation");
const { sendReturnStatusEmail } = require("../utils/emailService");
const { broadcastMessage } = require("../controllers/messageController");

// Public routes
router.post("/register", adminRegisterValidation, register);
router.post("/login", adminLoginValidation, login);

// Protected routes (Admin only)
router.get("/profile", protectAdmin, getProfile);
router.put(
  "/profile",
  protectAdmin,
  adminProfileUpdateValidation,
  updateProfile
);
router.put(
  "/change-password",
  protectAdmin,
  adminPasswordChangeValidation,
  changePassword
);
router.post("/logout", protectAdmin, logout);

// Dashboard analytics endpoint
router.get("/dashboard", dashboardAnalytics);

// Section-wise dashboard endpoints
router.get("/dashboard/sales", realTimeSales);
router.get("/dashboard/orders", realTimeOrders);
router.get("/dashboard/products", async (req, res) => {
  try {
    const totalProducts = await require("../models/Product").countDocuments();
    res.json({
      success: true,
      data: { totalProducts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product analytics",
      error: error.message,
    });
  }
});
router.get("/dashboard/customers", async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments();
    res.json({
      success: true,
      data: { totalCustomers },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customer analytics",
      error: error.message,
    });
  }
});
router.get("/dashboard/subscriptions", subscriptionAnalytics);

// Add new route for subscription list
router.get("/dashboard/subscription-list", getAllSubscriptions);

// Add new route for sending subscription reminder email
router.post(
  "/dashboard/send-subscription-reminder",

  sendSubscriptionReminder
);

// Add new route for sending bulk subscription reminder emails
router.post(
  "/dashboard/send-bulk-subscription-reminder",
  sendBulkSubscriptionReminder
);

// Add new route for sending custom messages to all subscribers
router.post(
  "/dashboard/send-bulk-message",
  sendBulkMessageToSubscribers
);

// Add new route for adding member to subscription
router.post("/dashboard/add-member", addMemberToSubscription);

// Real-time dashboard endpoints
router.get("/dashboard/orders/realtime", realTimeOrders);
router.get("/dashboard/sales/realtime", realTimeSales);
router.get("/dashboard/cached", cachedAnalytics);

// List all returns
router.get("/returns", protectAdmin, async (req, res) => {
  try {
    // Aggregate all returns from all users with populated order data
    const users = await User.find({}, "email phone returns")
      .populate({
        path: "returns.orderId",
        select: "orderId", // Get the human-readable orderId from Order model
      })
      .populate({
        path: "returns.productId",
        select: "name", // Get product name for better display
      });

    const allReturns = [];
    users.forEach((user) => {
      (user.returns || []).forEach((ret) => {
        allReturns.push({
          _id: ret._id,
          userId: user._id,
          user: { email: user.email, phone: user.phone },
          orderId: ret.orderId?.orderId || ret.orderId, // Use human-readable orderId
          orderObjectId: ret.orderId?._id, // Keep original ObjectId for reference
          productId: ret.productId?._id || ret.productId,
          productName: ret.productId?.name || "Unknown Product",
          reason: ret.reason,
          status: ret.status,
          rejectionReason: ret.rejectionReason || "",
          received: ret.received || false,
          date: ret.date,
        });
      });
    });
    res.json({ success: true, data: allReturns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update return status
router.patch("/returns/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (
      !["pending", "approved", "rejected", "return_rejected", "completed"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }
    // Find the user and return by return _id
    const user = await User.findOne({ "returns._id": req.params.id });
    if (!user) return res.status(404).json({ message: "Return not found" });
    const ret = user.returns.id(req.params.id);
    if (!ret) return res.status(404).json({ message: "Return not found" });
    ret.status = status;
    if (status === "return_rejected" && typeof rejectionReason === "string") {
      ret.rejectionReason = rejectionReason;
    }
    await user.save();

    // If approved, update product stockQuantity and soldCount
    if (status === "approved") {
      const Product = require("../models/Product");
      const product = await Product.findById(ret.productId);
      if (product) {
        // Increase stockQuantity by the returned quantity
        product.stockQuantity =
          (product.stockQuantity || 0) + (ret.quantity || 1);
        // Decrease soldCount by the returned quantity, but not below 0
        product.soldCount = Math.max(
          0,
          (product.soldCount || 0) - (ret.quantity || 1)
        );
        await product.save();
      }
    }

    // Send return status update email
    sendReturnStatusEmail(
      user.email,
      user.name,
      ret.orderId,
      ret.productId,
      status
    ).catch(console.error);
    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark return as received
router.patch("/returns/:id/received", protectAdmin, async (req, res) => {
  try {
    // Find the user and return by return _id
    const user = await User.findOne({ "returns._id": req.params.id });
    if (!user) return res.status(404).json({ message: "Return not found" });
    const ret = user.returns.id(req.params.id);
    if (!ret) return res.status(404).json({ message: "Return not found" });
    ret.received = true;
    await user.save();
    res.json({ success: true, message: "Return marked as received" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Broadcast message to all users (admin only)
router.post("/messages/broadcast", broadcastMessage);

module.exports = router;
