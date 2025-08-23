const Product = require("../models/Product");

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      categories,
      tags,
      isActive,
      isFeatured,
      isBeatenExclusive,
      minPrice,
      maxPrice,
      color,
      size,
      sort = "newest",
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (categories) {
      filter.categories = {
        $in: Array.isArray(categories) ? categories : [categories],
      };
    }
    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }
    if (isBeatenExclusive !== undefined) {
      filter.isBeatenExclusive = isBeatenExclusive === "true";
    }
    // Variant-based filtering
    if (color) {
      filter["variants.color"] = {
        $in: Array.isArray(color) ? color : [color],
      };
    }
    if (size) {
      filter["variants.size"] = { $in: Array.isArray(size) ? size : [size] };
    }
    if (minPrice || maxPrice) {
      filter["variants.price"] = {};
      if (minPrice) filter["variants.price"].$gte = Number(minPrice);
      if (maxPrice) filter["variants.price"].$lte = Number(maxPrice);
    }
    // Search functionality
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case "price_asc":
        sortObj = { "variants.price": 1 };
        break;
      case "price_desc":
        sortObj = { "variants.price": -1 };
        break;
      case "rating":
        sortObj = { rating: -1 };
        break;
      case "popular":
        sortObj = { reviews: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Ensure all products have the isBeatenExclusive field
    const productsWithDefaults = products.map(product => ({
      ...product,
      isBeatenExclusive: product.isBeatenExclusive ?? false
    }));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: productsWithDefaults,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNextPage: skip + products.length < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        isBeatenExclusive: product.isBeatenExclusive ?? false
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
const createProduct = async (req, res) => {
  try {
    console.log("Request body received:", JSON.stringify(req.body, null, 2));
    console.log("isBeatenExclusive in request:", req.body.isBeatenExclusive);
    
    // Convert string numbers to actual numbers
    if (req.body.price && typeof req.body.price === 'string') {
      req.body.price = Number(req.body.price);
    }
    if (req.body.originalPrice && typeof req.body.originalPrice === 'string') {
      req.body.originalPrice = Number(req.body.originalPrice);
    }
    if (req.body.stockQuantity && typeof req.body.stockQuantity === 'string') {
      req.body.stockQuantity = Number(req.body.stockQuantity);
    }
    
    // Remove any fields that are not in our schema
    delete req.body.Beaten_Launch_Sale_Drop_1;
    
    // Ensure images is always an array and image is the 0th index
    if (Array.isArray(req.body.images)) {
      if (req.body.images.length === 0 && req.body.image) {
        req.body.images = [req.body.image];
      }
      req.body.image = req.body.images[0];
    } else if (req.body.images) {
      req.body.images = [req.body.images];
      req.body.image = req.body.images[0];
    } else if (req.body.image) {
      req.body.images = [req.body.image];
    }
    
    // Handle material and care fields
    if (req.body.material) {
      if (!req.body.specifications) req.body.specifications = {};
      req.body.specifications.Material = req.body.material;
    }
    
    if (req.body.care) {
      if (!req.body.specifications) req.body.specifications = {};
      req.body.specifications.Care = req.body.care;
    }
    
    // Remove fit and origin from specifications if present
    if (req.body.specifications) {
      delete req.body.specifications.Fit;
      delete req.body.specifications.Origin;
    }
    
    // Ensure isBeatenExclusive is properly set
    if (req.body.isBeatenExclusive === undefined) {
      req.body.isBeatenExclusive = false;
    }
    
    console.log("Final request body before creation:", JSON.stringify(req.body, null, 2));
    console.log("isBeatenExclusive before creation:", req.body.isBeatenExclusive);
    
    const product = await Product.create(req.body);
    
    console.log("Created product isBeatenExclusive:", product.isBeatenExclusive);
    console.log("Created product:", JSON.stringify(product.toObject(), null, 2));

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
  try {
    // Ensure images is always an array and image is the 0th index
    if (Array.isArray(req.body.images)) {
      if (req.body.images.length === 0 && req.body.image) {
        req.body.images = [req.body.image];
      }
      req.body.image = req.body.images[0];
    } else if (req.body.images) {
      req.body.images = [req.body.images];
      req.body.image = req.body.images[0];
    } else if (req.body.image) {
      req.body.images = [req.body.image];
    }
    
    // Handle material and care fields
    if (req.body.material) {
      if (!req.body.specifications) req.body.specifications = {};
      req.body.specifications.Material = req.body.material;
    }
    
    if (req.body.care) {
      if (!req.body.specifications) req.body.specifications = {};
      req.body.specifications.Care = req.body.care;
    }
    
    // Remove fit and origin from specifications if present
    if (req.body.specifications) {
      delete req.body.specifications.Fit;
      delete req.body.specifications.Origin;
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// @desc    Get products by category (now by categories array)
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find({ categories: category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const total = await Product.countDocuments({ categories: category });
    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
      },
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products by category",
      error: error.message,
    });
  }
};

// @desc    Search products (by name, tags, categories)
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }
    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { categories: { $regex: q, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const total = await Product.countDocuments({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { categories: { $regex: q, $options: "i" } },
      ],
    });
    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message,
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("categories");
    res.json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// @desc    Bulk update products
// @route   PUT /api/products/bulk-update
// @access  Private (Admin only)
const bulkUpdateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Products must be an array",
      });
    }
    const updatePromises = products.map((product) =>
      Product.findByIdAndUpdate(product._id, product, { new: true })
    );
    const updatedProducts = await Promise.all(updatePromises);
    res.json({
      success: true,
      data: updatedProducts,
      message: `${updatedProducts.length} products updated successfully`,
    });
  } catch (error) {
    console.error("Error bulk updating products:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk updating products",
      error: error.message,
    });
  }
};

// @desc    Get product statistics (basic)
// @route   GET /api/products/stats
// @access  Private (Admin only)
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    // Get category distribution
    const categoryStats = await Product.aggregate([
      {
        $unwind: "$categories",
      },
      {
        $group: {
          _id: "$categories",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({
      success: true,
      data: {
        totalProducts,
        featuredProducts,
        categoryStats,
      },
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product stats",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getCategories,
  bulkUpdateProducts,
  getProductStats,
};
