const { body, param, validationResult } = require("express-validator");

// Allowed enums from schema
const allowedCategories = [
  "T-shirts",
  "Shirts",
  "Bottom Wear",
  "Hoodies",
  "Jackets",
  "Co-ord Sets",
  "Dresses",
];
const allowedCollections = [
  "Beaten Exclusive Collection",
  "Beaten Launch Sale Vol 1",
  "Beaten Signature Collection",
  "New Arrivals",
  "Best Sellers",
  "Summer Collection",
  "Winter Collection",
];
const allowedGenders = ["MEN", "WOMEN"];

// Validation rules for creating a product (only required fields)
const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(allowedCategories)
    .withMessage("Invalid category"),

  body("subCategory")
    .notEmpty()
    .withMessage("Sub Category is required")
    .isString()
    .withMessage("Sub Category must be a string"),

  body("collectionName")
    .notEmpty()
    .withMessage("Collection is required")
    .isIn(allowedCollections)
    .withMessage("Invalid collection"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(allowedGenders)
    .withMessage("Invalid gender"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("image")
    .notEmpty()
    .withMessage("Image is required")
    .isString()
    .withMessage("Image must be a string"),
];

// Validation rules for updating a product (only required fields, but all optional)
const updateProductValidation = [
  param("id").isMongoId().withMessage("Invalid product ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("category")
    .optional()
    .isIn(allowedCategories)
    .withMessage("Invalid category"),

  body("subCategory")
    .optional()
    .isString()
    .withMessage("Sub Category must be a string"),

  body("collectionName")
    .optional()
    .isIn(allowedCollections)
    .withMessage("Invalid collection"),

  body("gender").optional().isIn(allowedGenders).withMessage("Invalid gender"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("image").optional().isString().withMessage("Image must be a string"),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

module.exports = {
  createProductValidation,
  updateProductValidation,
  handleValidationErrors,
};
