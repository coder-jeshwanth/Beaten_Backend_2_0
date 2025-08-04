const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByGender,
  getProductsByCollection,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getCategories,
  bulkUpdateProducts,
  getProductStats,
} = require("../controllers/productController");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const {
  createProductValidation,
  updateProductValidation,

  handleValidationErrors,
} = require("../middleware/productValidation");

// Public routes
router.get("/",  getProducts);
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get(
  "/category/:category",
  getProductsByCategory
);

router.get("/:id", getProductById);

// Protected routes (Admin only)
router.post(
  "/",
  // protect,
  // authorize("admin"),
  // createProductValidation,
  // handleValidationErrors,
  createProduct
);
router.put(
  "/:id",
  // protect,
  // authorize("admin"),
  // updateProductValidation,
  // handleValidationErrors,
  updateProduct
);
router.delete(
  "/:id",
  // protect,
  // authorize("admin"),
  // handleValidationErrors,
  deleteProduct
);
router.put(
  "/bulk-update",
  protect,
  authorize("admin"),
  handleValidationErrors,
  bulkUpdateProducts
);
router.get("/stats", protect, authorize("admin"), getProductStats);

module.exports = router;
