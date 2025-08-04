const mongoose = require("mongoose");
const Admin = require("../models/Admin");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: "admin@beaten.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      name: "Admin",
      email: "admin@beaten.com",
      password: "Admin123!",
      isActive: true,
      emailVerified: true,
    });

    console.log("Admin created successfully:", {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
