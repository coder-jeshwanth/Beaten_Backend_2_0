const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: function () {
        return this.price;
      },
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      required: true,
      enum: [
        "T-shirts",
        "Shirts",
        "Bottom Wear",
        "Hoodies",
        "Jackets",
        "Co-ord Sets",
        "Dresses",
      ],
      default: "T-shirts",
    },
    subCategory: {
      type: String,
      required: true,
    },
    collectionName: {
      type: String,
      required: true,
      enum: [
        "Beaten Exclusive Collection",
        "Beaten Launch Sale Drop 1",
        "Beaten Signature Collection",
        "New Arrivals",
        "Best Sellers",
        "Summer Collection",
        "Winter Collection",
      ],
      default: "New Arrivals",
    },
    gender: {
      type: String,
      required: true,
      enum: ["MEN", "WOMEN"],
      default: "MEN",
    },
    sizes: [
      {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL"],
        default: "M",
      },
    ],
    colors: [
      {
        type: String,
        default: "Black",
      },
    ],
    fit: {
      type: String,
      enum: ["Slim", "Oversized", "Regular"],
      default: "Regular",
    },
    description: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
    specifications: {
      Material: String,
      Care: String,
    },
    material: {
      type: String,
      default: function() {
        return this.specifications?.Material || "";
      }
    },
    care: {
      type: String,
      default: function() {
        return this.specifications?.Care || "";
      }
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isBeatenExclusive: {
      type: Boolean,
      default: false,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
    },
    hsn: {
      type: String,
      default: "6109", // Default HSN code for garments
    },
    soldCount: {
      type: Number,
      min: 0,
      default: 0,
    },
      variantStock: {
        type: Object,
        default: {},
      },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
