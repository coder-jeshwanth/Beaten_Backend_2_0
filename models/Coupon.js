const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["public", "personal"], default: "public" },
    category: { type: String, default: "" }, // e.g., product/category-wide
    discountType: { type: String, enum: ["percentage", "flat"], required: true, default: "percentage" },
    discount: { type: Number, required: true }, // percent or flat value depending on discountType
    minPurchase: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "expired", "used"],
      default: "active",
    },
    description: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
