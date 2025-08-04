const Review = require("../models/Review");
const Product = require("../models/Product");

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // Optionally: check if user already reviewed this product
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product." });
    }
    const review = new Review({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reviews for a product
exports.getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a review (only by owner)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a review (only by owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized." });
    }
    await review.deleteOne();
    res.json({ message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
