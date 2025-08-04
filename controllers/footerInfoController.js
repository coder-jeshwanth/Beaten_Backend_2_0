const FooterInfo = require("../models/FooterInfo");

// Get aboutUsPage info
exports.getAboutUsPage = async (req, res) => {
  try {
    const info = await FooterInfo.findOne();
    if (!info) {
      return res.status(404).json({ message: "About Us page info not found" });
    }
    res.json(info.aboutUsPage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create aboutUsPage info
exports.createAboutUsPage = async (req, res) => {
  try {
    const { aboutContent, storyContent, image } = req.body;
    const newInfo = new FooterInfo({
      aboutUsPage: { aboutContent, storyContent, image },
    });
    await newInfo.save();
    res.status(201).json(newInfo.aboutUsPage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update aboutUsPage info
exports.updateAboutUsPage = async (req, res) => {
  try {
    const { aboutContent, storyContent, image } = req.body;
    const info = await FooterInfo.findOne();
    if (!info) {
      return res.status(404).json({ message: "About Us page info not found" });
    }
    info.aboutUsPage = { aboutContent, storyContent, image };
    await info.save();
    res.json(info.aboutUsPage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
