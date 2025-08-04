const express = require("express");
const router = express.Router();
const footerInfoController = require("../controllers/footerInfoController");

// Get aboutUsPage info
router.get("/about-us", footerInfoController.getAboutUsPage);

// Create aboutUsPage info
router.post("/about-us", footerInfoController.createAboutUsPage);

// Update aboutUsPage info
router.put("/about-us", footerInfoController.updateAboutUsPage);

module.exports = router;
