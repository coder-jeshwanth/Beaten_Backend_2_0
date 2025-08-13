const Coupon = require("../models/Coupon");
const User = require("../models/User");

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { discountType, discount } = req.body;
    if (!discountType || !["percentage", "flat"].includes(discountType)) {
      return res.status(400).json({ success: false, message: "Invalid or missing discountType. Must be 'percentage' or 'flat'." });
    }
    if (typeof discount !== "number" || discount <= 0) {
      return res.status(400).json({ success: false, message: "Discount value must be a positive number." });
    }
    if (discountType === "percentage" && (discount > 100)) {
      return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100%." });
    }
    const coupon = new Coupon({ ...req.body, createdBy: req.admin._id });
    await coupon.save();
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get/list/search coupons (Admin - sees all types)
exports.getCoupons = async (req, res) => {
  try {
    const { search, type, status } = req.query;
    const filter = {};
    if (search) filter.code = { $regex: search, $options: "i" };
    if (type) filter.type = type;
    if (status) filter.status = status;
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { discountType, discount } = req.body;
    if (discountType && !["percentage", "flat"].includes(discountType)) {
      return res.status(400).json({ success: false, message: "Invalid discountType. Must be 'percentage' or 'flat'." });
    }
    if (discount !== undefined) {
      if (typeof discount !== "number" || discount <= 0) {
        return res.status(400).json({ success: false, message: "Discount value must be a positive number." });
      }
      if (discountType === "percentage" && discount > 100) {
        return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100%." });
      }
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Validate/apply coupon (user side)
exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code });
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon code" });

    // Only allow public coupons for users
    // if (coupon.type !== "public") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This coupon is not available for public use",
    //   });
    // }

    const now = new Date();
    if (
      coupon.status !== "active" ||
      now < coupon.validFrom ||
      now > coupon.validUntil
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon is not valid at this time" });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon usage limit reached" });
    }
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase is $${coupon.minPurchase}`,
      });
    }

    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get available coupons for users (only public coupons)
exports.getUserCoupons = async (req, res) => {
  try {
    const now = new Date();
   
    const coupons = await Coupon.find({
      type: "public",
      status: "active",
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).select(
      "code description discount discountType minPurchase validUntil usageLimit usedCount category type status"
    );

    // Filter out coupons that have reached usage limit or are expired
    const availableCoupons = coupons.filter((coupon) => {
      const isNotExpired = new Date(coupon.validUntil) >= now;
      return (
        (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) &&
        isNotExpired
      );
    });

    res.json({
      success: true,
      data: availableCoupons,
      count: availableCoupons.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
