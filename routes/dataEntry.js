const express = require("express");
const router = express.Router();
const dataEntryController = require("../controllers/dataEntryController");

// Create a new DataEntry
router.post("/", dataEntryController.createDataEntry);

// Get all DataEntries
router.get("/", dataEntryController.getDataEntries);

// Get a single DataEntry by ID
router.get("/:id", dataEntryController.getDataEntryById);

// Update a DataEntry by ID
router.put("/:id", dataEntryController.updateDataEntry);

// Delete a DataEntry by ID
router.delete("/:id", dataEntryController.deleteDataEntry);

// SlideImages endpoints
router.get("/:id/slide-images", dataEntryController.getSlideImages);
router.put("/:id/slide-images", dataEntryController.updateSlideImages);
router.delete("/:id/slide-images", dataEntryController.deleteSlideImages);

//Mobile Slides Images endpoints
router.get("/:id/mobile-slide-images", dataEntryController.getMobileSlideImages);
router.put("/:id/mobile-slide-images", dataEntryController.updateMobileSlideImages);
router.delete("/:id/mobile-slide-images", dataEntryController.deleteMobileSlideImages);

// Collection images
router.get("/:id/collection-images", dataEntryController.getCollectionImages);
router.put("/:id/collection-images", dataEntryController.updateCollectionImages);

// Mobile Collection images
router.get("/:id/mobile-collection-images", dataEntryController.getMobileCollectionImages);
router.put("/:id/mobile-collection-images", dataEntryController.updateMobileCollectionImages);

// Collections endpoints
router.get("/:id/collections", dataEntryController.getCollections);
router.put("/:id/collections", dataEntryController.updateCollections);

// router.delete("/:id/mobile-slide-images", dataEntryController.deleteMobileSlideImages);

// NewsContent endpoints
router.get("/:id/news-content", dataEntryController.getNewsContent);
router.put("/:id/news-content", dataEntryController.updateNewsContent);
router.delete("/:id/news-content", dataEntryController.deleteNewsContent);

module.exports = router;
