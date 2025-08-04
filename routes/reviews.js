const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// Create a review
router.post("/", protect, reviewController.createReview);
// Get all reviews for a product
router.get("/product/:productId", reviewController.getReviewsForProduct);
// Update a review
router.put("/:reviewId", protect, reviewController.updateReview);
// Delete a review
router.delete("/:reviewId", protect, reviewController.deleteReview);

module.exports = router;
