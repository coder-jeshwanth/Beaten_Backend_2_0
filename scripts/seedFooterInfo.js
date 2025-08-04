const mongoose = require("mongoose");
const FooterInfo = require("../models/FooterInfo");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URI = "mongodb+srv://sunandvemavarapu:NnqszrAB584zCkY9@beaten1.vknkzsa.mongodb.net/?retryWrites=true&w=majority&appName=beaten1" || "mongodb://localhost:27017/beaten";

const aboutContent = `Founded by two brothers with a shared passion for fashion and an unwavering vision, Beaten was born to create a unique space in the fashion industry. Our collection captures the essence of modern luxury, inspired by global trends and refined aesthetics. We aim to deliver standout designs with a premium yet affordable approach.`;

const storyContent = `Founded by two brothers with a shared passion for fashion and an unwavering vision, Beaten was born to create a unique space in the fashion industry. Our collection captures the essence of modern luxury, inspired by global trends and refined aesthetics. We aim to deliver standout designs with a premium yet affordable approach.`;

const image =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";

async function seedFooterInfo() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await FooterInfo.deleteMany({});
    const footerInfo = new FooterInfo({
      aboutUsPage: {
        aboutContent,
        storyContent,
        image,
      },
    });
    await footerInfo.save();
    console.log("FooterInfo seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding FooterInfo:", error);
    process.exit(1);
  }
}

seedFooterInfo();
