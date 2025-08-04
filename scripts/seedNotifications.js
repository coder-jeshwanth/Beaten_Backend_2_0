const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const MONGO_URI = "mongodb+srv://sunandvemavarapu:NnqszrAB584zCkY9@beaten1.vknkzsa.mongodb.net/?retryWrites=true&w=majority&appName=beaten1" || "mongodb://localhost:27017/beaten1";

async function seedNotifications() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const users = await User.find();
    if (!users.length) {
      console.log("No users found.");
      return;
    }

    const notifications = users.map((user) => ({
      userId: user._id,
      type: "message",
      message: "This is a seeded notification for testing.",
      read: false,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    console.log(`Seeded ${notifications.length} notifications.`);
  } catch (err) {
    console.error("Error seeding notifications:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedNotifications();
