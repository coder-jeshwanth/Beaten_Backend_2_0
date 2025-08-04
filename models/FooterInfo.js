const mongoose = require("mongoose");

const footerInfoSchema = new mongoose.Schema({
  aboutUsPage: {
    aboutContent: {
      type: String,
      default: "",
    },
    storyContent: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
});

module.exports = mongoose.model("FooterInfo", footerInfoSchema);
