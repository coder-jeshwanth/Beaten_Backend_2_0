const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  gst: { type: Number, required: true }, // GST amount for this item
  image: { type: String },
  size: { type: String },
  color: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        // Generate 12-character order ID: ORD + 9 random alphanumeric characters
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "ORD";
        for (let i = 0; i < 9; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    paymentInfo: {
      id: { type: String },
      status: { type: String },
      method: { type: String },
      originalPrice: { type: Number }, // Store original price before discounts
    },
    totalPrice: { type: Number, required: true },
    invoiceId: {
      type: String,
      unique: true,
      default: function () {
        // Generate invoice ID: INV-{timestamp}-{random}
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        return `INV-${timestamp}-${random}`;
      },
    },
    coupon: {
      code: { type: String },
      discountType: { type: String, enum: ["percentage", "flat"] },
      discount: { type: Number },
      discountAmount: { type: Number }, // The amount discounted from total
    },
    shiprocketShipmentId: {
      type: String, // This stores the Shiprocket shipment_id
      default: null,
    },
    subscriptionDiscount: {
      applied: { type: Boolean, default: false },
      amount: { type: Number, default: 0 }, // Amount deducted due to subscription
      subscriptionCost: { type: Number, default: 0 }, // User's subscription cost (249)
    },
    status: {
      type: String,
      // enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "pending",
    },
    awbNumber: {
      type: String,
      default: function () {
        // Generate a random 15-digit AWB number
        return Math.floor(Math.random() * 900000000000000) + 100000000000000;
      },
    },
    returnRequest: {
      reason: { type: String },
      items: [{
        itemId: { type: mongoose.Schema.Types.ObjectId },
        reason: { type: String }
      }],
      status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'return_completed'],
        default: 'pending'
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date },
      completedAt: { type: Date }
    },
    returnCompletedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
