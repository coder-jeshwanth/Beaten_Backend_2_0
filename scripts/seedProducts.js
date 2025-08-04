const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const Product = require("../models/Product");

// Sample product data with variants
const sampleProducts = [
  {
    name: "Premium Street T-Shirt",
    price: 1299,
    originalPrice: 1499,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    ],
    category: "T-shirts",
    subCategory: "Streetwear",
    collectionName: "Beaten Exclusive Collection",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    fit: "Oversized",
    description:
      "Premium quality streetwear t-shirt crafted for urban style enthusiasts.",
    features: ["100% Cotton", "Oversized Fit", "High Quality Print"],
    specifications: {
      Material: "Cotton",
      Fit: "Oversized",
      Care: "Machine wash",
      Origin: "India",
    },
    inStock: true,
    rating: 4.5,
    reviews: 128,
    tags: ["premium", "streetwear", "urban", "casual"],
    discount: 13,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    stockQuantity: 100,
    soldCount: 245,
    sku: "TS-PREM-BLK-001",
  },
  {
    name: "Classic White Shirt",
    price: 1599,
    originalPrice: 1799,
    image:
      "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    ],
    category: "Shirts",
    subCategory: "Classic",
    collectionName: "Beaten Signature Collection",
    gender: "MEN",
    sizes: ["M", "L", "XL"],
    colors: ["White"],
    fit: "Regular",
    description: "A classic white shirt for all occasions.",
    features: ["Breathable", "Classic Fit"],
    specifications: {
      Material: "Cotton",
      Fit: "Regular",
      Care: "Hand wash",
      Origin: "India",
    },
    inStock: true,
    rating: 4.2,
    reviews: 98,
    tags: ["classic", "formal", "office"],
    discount: 11,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    stockQuantity: 80,
    soldCount: 156,
    sku: "SH-CLSC-WHT-002",
  },
  {
    name: "Denim Jacket",
    price: 2499,
    originalPrice: 2999,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    ],
    category: "Jackets",
    subCategory: "Denim",
    collectionName: "Winter Collection",
    gender: "WOMEN",
    sizes: ["S", "M", "L"],
    colors: ["Blue"],
    fit: "Regular",
    description: "Trendy denim jacket for a cool look.",
    features: ["Durable", "Trendy Design"],
    specifications: {
      Material: "Denim",
      Fit: "Regular",
      Care: "Dry clean",
      Origin: "India",
    },
    inStock: true,
    rating: 4.7,
    reviews: 150,
    tags: ["denim", "jacket", "winter"],
    discount: 17,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    stockQuantity: 60,
    soldCount: 389,
    sku: "JK-DEN-BLU-003",
  },
  {
    name: "Summer Dress",
    price: 1899,
    originalPrice: 2199,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=400&q=80",
    ],
    category: "Dresses",
    subCategory: "Summer",
    collectionName: "Summer Collection",
    gender: "WOMEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Yellow", "White"],
    fit: "Regular",
    description: "Lightweight summer dress for a breezy day.",
    features: ["Lightweight", "Comfortable"],
    specifications: {
      Material: "Linen",
      Fit: "Regular",
      Care: "Machine wash",
      Origin: "India",
    },
    inStock: true,
    rating: 4.3,
    reviews: 75,
    tags: ["summer", "dress", "lightweight"],
    discount: 14,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    stockQuantity: 70,
    soldCount: 98,
    sku: "DR-SUM-YLW-004",
  },
  {
    name: "Urban Hoodie",
    price: 2099,
    originalPrice: 2399,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    ],
    category: "Hoodies",
    subCategory: "Urban",
    collectionName: "Beaten Launch Sale Vol 1",
    gender: "MEN",
    sizes: ["M", "L", "XL"],
    colors: ["Black", "Grey"],
    fit: "Regular",
    description: "Stay warm and stylish with this urban hoodie.",
    features: ["Soft Fleece", "Adjustable Hood"],
    specifications: {
      Material: "Fleece",
      Fit: "Regular",
      Care: "Machine wash",
      Origin: "India",
    },
    inStock: true,
    rating: 4.6,
    reviews: 110,
    tags: ["hoodie", "urban", "winter"],
    discount: 13,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    stockQuantity: 90,
    soldCount: 423,
    sku: "HD-URB-BLK-005",
  },
  {
    name: "Slim Fit Chinos",
    price: 1399,
    originalPrice: 1699,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    ],
    category: "Bottom Wear",
    subCategory: "Chinos",
    collectionName: "Best Sellers",
    gender: "MEN",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Navy"],
    fit: "Slim",
    description: "Versatile slim fit chinos for every occasion.",
    features: ["Stretch Fabric", "Slim Fit"],
    specifications: {
      Material: "Cotton Blend",
      Fit: "Slim",
      Care: "Machine wash",
      Origin: "India",
    },
    inStock: true,
    rating: 4.4,
    reviews: 85,
    tags: ["chinos", "slim", "casual"],
    discount: 18,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    stockQuantity: 120,
    soldCount: 312,
    sku: "BW-CHN-BGE-006",
  },
  {
    name: "Oversized Graphic Tee",
    price: 1199,
    originalPrice: 1399,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    ],
    category: "T-shirts",
    subCategory: "Graphic",
    collectionName: "New Arrivals",
    gender: "WOMEN",
    sizes: ["S", "M", "L"],
    colors: ["Pink", "White"],
    fit: "Oversized",
    description: "Trendy oversized tee with bold graphics.",
    features: ["Bold Print", "Oversized Fit"],
    specifications: {
      Material: "Cotton",
      Fit: "Oversized",
      Care: "Machine wash",
      Origin: "India",
    },
    inStock: true,
    rating: 4.1,
    reviews: 60,
    tags: ["graphic", "oversized", "trendy"],
    discount: 14,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    stockQuantity: 75,
    soldCount: 67,
    sku: "TS-GRA-PNK-007",
  },
  {
    name: "Formal Blue Shirt",
    price: 1699,
    originalPrice: 1999,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=400&q=80",
    ],
    category: "Shirts",
    subCategory: "Formal",
    collectionName: "Beaten Signature Collection",
    gender: "MEN",
    sizes: ["M", "L", "XL"],
    colors: ["Blue"],
    fit: "Slim",
    description: "Elegant formal shirt for business meetings.",
    features: ["Slim Fit", "Easy Iron"],
    specifications: {
      Material: "Cotton",
      Fit: "Slim",
      Care: "Hand wash",
      Origin: "India",
    },
    inStock: true,
    rating: 4.3,
    reviews: 70,
    tags: ["formal", "business", "slim"],
    discount: 15,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    stockQuantity: 65,
    soldCount: 234,
    sku: "SH-FRM-BLU-008",
  },
  {
    name: "Winter Co-ord Set",
    price: 2299,
    originalPrice: 2599,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    ],
    category: "Co-ord Sets",
    subCategory: "Winter",
    collectionName: "Winter Collection",
    gender: "WOMEN",
    sizes: ["S", "M", "L"],
    colors: ["Grey", "Black"],
    fit: "Regular",
    description: "Stay cozy and stylish with this winter co-ord set.",
    features: ["Warm Fabric", "Matching Set"],
    specifications: {
      Material: "Wool Blend",
      Fit: "Regular",
      Care: "Dry clean",
      Origin: "India",
    },
    inStock: true,
    rating: 4.5,
    reviews: 90,
    tags: ["co-ord", "winter", "set"],
    discount: 12,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    stockQuantity: 55,
    soldCount: 178,
    sku: "CS-WIN-GRY-009",
  },
  // ... Add 21 more products in the same format, changing names, images, categories, etc.
];

// Connect to MongoDB and seed data
const seedProducts = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.error("❌ Error: MONGODB_URI is not defined in your .env file.");
      console.error(
        "📝 Please create a .env file in the backend directory with the following content:"
      );
      console.error("");
      console.error("# Server Configuration");
      console.error("PORT=5000");
      console.error("NODE_ENV=development");
      console.error("");
      console.error("# MongoDB Configuration");
      console.error("MONGODB_URI=mongodb://localhost:27017/beaten_db");
      console.error("");
      console.error("# JWT Configuration");
      console.error(
        "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production"
      );
      console.error("JWT_EXPIRE=7d");
      console.error("");
      console.error(
        "💡 You can copy from env.example file: cp env.example .env"
      );
      console.error("");
      throw new Error(
        "MONGODB_URI is not defined in your .env file. Please check your environment configuration."
      );
    }

    console.log("Attempting to connect to MongoDB...");
    // console.log(
    //   "MongoDB URI:",
    //   process.env.MONGODB_URI.substring(0, 20) + "..."
    // );

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB");

    // Clear existing products
    //await Product.deleteMany({});
    // await Product.collection.drop();
    //console.log("Cleared existing products");

    // Insert new products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    // Display summary
    console.log("\nSeeded Products Summary:");
    insertedProducts.forEach((product) => {
      console.log(`- ${product.name}: ${product.variants.length} variants`);
    });

    console.log("\nDatabase seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedProducts();
