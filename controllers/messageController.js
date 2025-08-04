const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendUserNotificationEmail } = require("../utils/emailService");

const broadcastMessage = async (req, res) => {
  try {
    // const adminId = req.admin._id; // assuming req.admin is set by auth middleware
    const { content } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Message content is required." });
    }
    // Fetch all users
    const users = await User.find({}, "_id email");
    if (!users.length) {
      return res
        .status(404)
        .json({ success: false, message: "No users found." });
    }
    // Send message, notification, and email to each user
    for (const user of users) {
      // Create message
      await Message.create({ recipient: user._id, content });
      await Notification.create({
        userId: user._id,
        type: "message",
        message: content,
        read: false,
      });
      // Send email
      await sendUserNotificationEmail(user.email, content);
    }
    res
      .status(200)
      .json({ success: true, message: "Message broadcasted to all users." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to broadcast message." });
  }
};

const getUserMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({ recipient: userId })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages." });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications." });
  }
};

// Get unread notification count for the logged-in user
// GET /api/user/notifications/unread-count
const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, read: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count.",
    });
  }
};

// Mark a notification as read for the logged-in user
// PATCH /api/user/notifications/:id/read
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
};

module.exports = {
  broadcastMessage,
  getUserMessages,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
};
