const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrderById,
  cancelOrder,
  deleteSubscriptionByEmail,
  initiateReturnRequest,
} = require("../controllers/orderController");
const { protect, protectAdmin } = require("../middleware/auth");

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post("/", protect, createOrder);

// @route   GET /api/orders/my-orders
// @desc    Get all orders for the logged-in user
// @access  Private
router.get("/my-orders", protect, getMyOrders);

// Admin: Get all orders
router.get("/", getAllOrders);
// Admin: Get order by ID
router.get("/:id", protect, protectAdmin, getOrderById);
// Admin: Update order status
router.put("/:id/status", updateOrderStatus);

// User: Cancel order (only their own order)
router.put("/:id/cancel", protect, cancelOrder);

// User: Get order by ID (only their own order)
router.get("/my/:id", protect, getMyOrderById);

// User: Initiate a return request for an order
router.post("/:id/return", protect, initiateReturnRequest);

// Admin: Delete subscription by email
router.delete(
  "/subscription/:email",
  // protect,
  // protectAdmin,
  deleteSubscriptionByEmail
);

module.exports = router;
