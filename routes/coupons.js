const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { protectAdmin } = require("../middleware/auth");

// Admin coupon management
router.post("/admin/coupons", protectAdmin, couponController.createCoupon);
router.get("/admin/coupons", protectAdmin, couponController.getCoupons);
router.patch("/admin/coupons/:id", protectAdmin, couponController.updateCoupon);
router.delete(
  "/admin/coupons/:id",
  protectAdmin,
  couponController.deleteCoupon
);

// User coupon routes
router.get("/coupons", couponController.getUserCoupons);
router.post("/coupons/apply", couponController.applyCoupon);

module.exports = router;
