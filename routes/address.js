const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const addressController = require("../controllers/addressController");

// Get all addresses for a user
router.get("/", protect, addressController.getAddresses);
// Add a new address
router.post("/", protect, addressController.addAddress);
// Update an address
router.patch("/:id", protect, addressController.updateAddress);
// Delete an address
router.delete("/:id", protect, addressController.deleteAddress);

module.exports = router; 