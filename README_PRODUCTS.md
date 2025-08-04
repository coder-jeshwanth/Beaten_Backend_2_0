# Product API Documentation

This document describes the Product API endpoints for the BEATEN e-commerce platform.

## Base URL
```
http://localhost:5000/api/products
```

## Authentication
- Public endpoints: No authentication required
- Protected endpoints: Require JWT token with admin role

## Product Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  price: Number (required, min: 0),
  originalPrice: Number (min: 0),
  image: String (required),
  images: [String],
  category: String (required, enum: ['T-shirts', 'Shirts', 'Bottom Wear', 'Hoodies', 'Jackets', 'Co-ord Sets', 'Dresses']),
  subCategory: String (required),
  collection: String (required, enum: ['Beaten Exclusive Collection', 'Beaten Launch Sale Vol 1', 'Beaten Signature Collection', 'New Arrivals', 'Best Sellers', 'Summer Collection', 'Winter Collection']),
  gender: String (required, enum: ['MEN', 'WOMEN']),
  sizes: [String] (enum: ['S', 'M', 'L', 'XL', 'XXL']),
  colors: [String],
  fit: String (enum: ['Slim', 'Oversized', 'Regular']),
  description: String (required),
  features: [String],
  specifications: {
    Material: String,
    Fit: String,
    Care: String,
    Origin: String
  },
  inStock: Boolean (default: true),
  rating: Number (min: 0, max: 5, default: 0),
  reviews: Number (min: 0, default: 0),
  tags: [String],
  discount: Number (min: 0, max: 100, default: 0),
  isFeatured: Boolean (default: false),
  isNewArrival: Boolean (default: false),
  isBestSeller: Boolean (default: false),
  stockQuantity: Number (min: 0, default: 0),
  sku: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Get All Products
**GET** `/api/products`

Get all products with filtering, sorting, and pagination.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 12, max: 100): Products per page
- `category` (string): Filter by category
- `subCategory` (string): Filter by sub-category
- `gender` (string): Filter by gender (MEN/WOMEN)
- `collection` (string): Filter by collection
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `size` (string): Filter by size
- `color` (string): Filter by color
- `fit` (string): Filter by fit
- `sort` (string): Sort order (newest, price_asc, price_desc, rating, popular)
- `search` (string): Search in name and description
- `isFeatured` (boolean): Filter featured products
- `isNewArrival` (boolean): Filter new arrivals
- `isBestSeller` (boolean): Filter best sellers
- `inStock` (boolean): Filter by stock availability

**Example:**
```bash
GET /api/products?page=1&limit=12&category=T-shirts&gender=MEN&sort=price_asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Premium Street T-Shirt",
      "price": 1299,
      "originalPrice": 1599,
      "image": "/images/1.png",
      "category": "T-shirts",
      "subCategory": "Regular",
      "collection": "Beaten Exclusive Collection",
      "gender": "MEN",
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Black", "White", "Navy"],
      "fit": "Regular",
      "description": "Premium quality streetwear t-shirt...",
      "inStock": true,
      "rating": 4.5,
      "reviews": 128,
      "discount": 19,
      "isFeatured": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 60,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get Product by ID
**GET** `/api/products/:id`

Get a single product by its ID.

**Parameters:**
- `id` (string, required): Product ID

**Example:**
```bash
GET /api/products/60f7b3b3b3b3b3b3b3b3b3b3
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Premium Street T-Shirt",
    "price": 1299,
    "originalPrice": 1599,
    "image": "/images/1.png",
    "images": ["/images/1.png", "/images/2.png", "/images/3.png", "/images/4.png"],
    "category": "T-shirts",
    "subCategory": "Regular",
    "collection": "Beaten Exclusive Collection",
    "gender": "MEN",
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Black", "White", "Navy"],
    "fit": "Regular",
    "description": "Premium quality streetwear t-shirt...",
    "features": ["Premium cotton blend", "Comfortable fit", "Durable construction", "Easy to maintain"],
    "specifications": {
      "Material": "100% Cotton",
      "Fit": "Regular",
      "Care": "Machine wash cold",
      "Origin": "India"
    },
    "inStock": true,
    "rating": 4.5,
    "reviews": 128,
    "tags": ["premium", "streetwear", "urban"],
    "discount": 19,
    "isFeatured": true,
    "stockQuantity": 50,
    "sku": "TS-PREM-001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Search Products
**GET** `/api/products/search`

Search products by name and description.

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)
- `page` (number, default: 1): Page number
- `limit` (number, default: 12): Products per page

**Example:**
```bash
GET /api/products/search?q=premium&page=1&limit=10
```

### 4. Get Featured Products
**GET** `/api/products/featured`

Get all featured products.

**Query Parameters:**
- `limit` (number, default: 8): Number of products to return

**Example:**
```bash
GET /api/products/featured?limit=6
```

### 5. Get New Arrivals
**GET** `/api/products/new-arrivals`

Get all new arrival products.

**Query Parameters:**
- `limit` (number, default: 8): Number of products to return

**Example:**
```bash
GET /api/products/new-arrivals?limit=10
```

### 6. Get Best Sellers
**GET** `/api/products/best-sellers`

Get all best seller products.

**Query Parameters:**
- `limit` (number, default: 8): Number of products to return

**Example:**
```bash
GET /api/products/best-sellers?limit=5
```

### 7. Get Products by Category
**GET** `/api/products/category/:category`

Get products filtered by category.

**Parameters:**
- `category` (string, required): Category name

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 12): Products per page

**Example:**
```bash
GET /api/products/category/T-shirts?page=1&limit=20
```

### 8. Get Products by Gender
**GET** `/api/products/gender/:gender`

Get products filtered by gender.

**Parameters:**
- `gender` (string, required): Gender (MEN/WOMEN)

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 12): Products per page

**Example:**
```bash
GET /api/products/gender/MEN?page=1&limit=15
```

### 9. Get Products by Collection
**GET** `/api/products/collection/:collection`

Get products filtered by collection.

**Parameters:**
- `collection` (string, required): Collection name

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 12): Products per page

**Example:**
```bash
GET /api/products/collection/Beaten%20Exclusive%20Collection?page=1&limit=10
```

### 10. Get Categories
**GET** `/api/products/categories`

Get all available categories, sub-categories, and collections.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["T-shirts", "Shirts", "Bottom Wear", "Hoodies", "Jackets", "Co-ord Sets", "Dresses"],
    "subCategories": ["Regular", "Oversized", "Graphic T-shirts", "Casual wear", "Formal wear", "Cargo Pants", "Jeans"],
    "collections": ["Beaten Exclusive Collection", "Beaten Launch Sale Vol 1", "Beaten Signature Collection", "New Arrivals", "Best Sellers", "Summer Collection", "Winter Collection"]
  }
}
```

## Admin Endpoints (Protected)

### 11. Create Product
**POST** `/api/products`

Create a new product (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "name": "New Product",
  "price": 1299,
  "originalPrice": 1599,
  "image": "/images/new-product.png",
  "images": ["/images/new-product.png", "/images/new-product-2.png"],
  "category": "T-shirts",
  "subCategory": "Regular",
  "collection": "Beaten Exclusive Collection",
  "gender": "MEN",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Black", "White"],
  "fit": "Regular",
  "description": "Product description...",
  "features": ["Feature 1", "Feature 2"],
  "specifications": {
    "Material": "100% Cotton",
    "Fit": "Regular",
    "Care": "Machine wash cold",
    "Origin": "India"
  },
  "inStock": true,
  "rating": 0,
  "reviews": 0,
  "tags": ["tag1", "tag2"],
  "discount": 0,
  "isFeatured": false,
  "isNewArrival": false,
  "isBestSeller": false,
  "stockQuantity": 50,
  "sku": "TS-NEW-001"
}
```

### 12. Update Product
**PUT** `/api/products/:id`

Update an existing product (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string, required): Product ID

**Body:** Same as create product (all fields optional)

### 13. Delete Product
**DELETE** `/api/products/:id`

Delete a product (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string, required): Product ID

### 14. Bulk Update Products
**PUT** `/api/products/bulk-update`

Update multiple products at once (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "products": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "price": 1399,
      "isFeatured": true
    },
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "inStock": false
    }
  ]
}
```

### 15. Get Product Statistics
**GET** `/api/products/stats`

Get product statistics (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 60,
    "inStockProducts": 55,
    "outOfStockProducts": 5,
    "featuredProducts": 10,
    "newArrivals": 8,
    "bestSellers": 12,
    "categoryStats": [
      { "_id": "T-shirts", "count": 20 },
      { "_id": "Shirts", "count": 15 },
      { "_id": "Bottom Wear", "count": 10 }
    ],
    "genderStats": [
      { "_id": "MEN", "count": 40 },
      { "_id": "WOMEN", "count": 20 }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Validation Errors

When validation fails, the response includes field-specific errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number",
      "value": -100
    },
    {
      "field": "category",
      "message": "Invalid category",
      "value": "InvalidCategory"
    }
  ]
}
```

## Database Seeding

To populate the database with sample products, run:

```bash
node backend/utils/seedProducts.js
```

This will create sample products based on the frontend mock data structure.

## Notes

- All timestamps are in ISO 8601 format
- Product IDs are MongoDB ObjectIds
- Image paths should be relative to the public directory
- The API supports text search on product names and descriptions
- Pagination is zero-based internally but one-based in the API
- All monetary values are in Indian Rupees (₹) 