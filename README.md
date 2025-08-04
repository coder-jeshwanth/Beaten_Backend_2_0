# Beaten Backend API

A robust Node.js backend API for the Beaten e-commerce platform built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **Authentication System**: Complete JWT-based authentication with register, login, and profile management
- **Security**: Helmet, CORS, rate limiting, and input validation
- **MVC Architecture**: Clean separation of concerns with models, views (controllers), and routes
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Request logging with Morgan
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Input validation using express-validator

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── authController.js     # Authentication logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Input validation
├── models/
│   └── User.js              # User schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── index.js             # Main routes
├── utils/
│   ├── generateToken.js     # JWT token generation
│   └── constants.js         # API constants
├── public/                  # Static files
├── server.js                # Main server file
├── package.json
└── env.example              # Environment variables template
```

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/beaten_db
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint             | Description         | Access  |
| ------ | -------------------- | ------------------- | ------- |
| POST   | `/api/auth/register` | Register new user   | Public  |
| POST   | `/api/auth/login`    | Login user          | Public  |
| GET    | `/api/auth/profile`  | Get user profile    | Private |
| PUT    | `/api/auth/profile`  | Update user profile | Private |
| POST   | `/api/auth/logout`   | Logout user         | Private |

### Health Check

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/api/health` | API health status |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login User

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitizes and validates input
- **Password Hashing**: bcryptjs for secure password storage
- **JWT**: Secure token-based authentication

## 📊 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🧪 Testing

### Using Postman

1. Import the provided Postman collection
2. Set up environment variables
3. Test the endpoints

### Using curl

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'

# Login user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

## 🔧 Development

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (to be implemented)

### Environment Variables

| Variable     | Description               | Default               |
| ------------ | ------------------------- | --------------------- |
| PORT         | Server port               | 5000                  |
| NODE_ENV     | Environment               | development           |
| MONGODB_URI  | MongoDB connection string | -                     |
| JWT_SECRET   | JWT secret key            | -                     |
| JWT_EXPIRE   | JWT expiration time       | 7d                    |
| FRONTEND_URL | Frontend URL for CORS     | http://localhost:3000 |

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set a strong JWT_SECRET
4. Configure CORS for production domain
5. Use PM2 or similar process manager

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
