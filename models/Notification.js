const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Optional: link to related resource
  link: {
    type: String,
  },
  // Optional: extra metadata
  meta: {
    type: Object,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
