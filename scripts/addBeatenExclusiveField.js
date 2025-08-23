const mongoose = require("mongoose");
const Product = require("../models/Product");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const addBeatenExclusiveField = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update all products that don't have the isBeatenExclusive field
    const result = await Product.updateMany(
      { isBeatenExclusive: { $exists: false } },
      { $set: { isBeatenExclusive: false } }
    );

    console.log(`Updated ${result.modifiedCount} products with isBeatenExclusive field`);

    // Optional: Set specific products as beaten exclusive based on collection name
    const exclusiveResult = await Product.updateMany(
      { 
        collectionName: "Beaten Exclusive Collection",
        isBeatenExclusive: { $ne: true }
      },
      { $set: { isBeatenExclusive: true } }
    );

    console.log(`Set ${exclusiveResult.modifiedCount} products from 'Beaten Exclusive Collection' as beaten exclusive`);

    await mongoose.disconnect();
    console.log("Database updated successfully");
  } catch (error) {
    console.error("Error updating products:", error);
    process.exit(1);
  }
};

addBeatenExclusiveField();
