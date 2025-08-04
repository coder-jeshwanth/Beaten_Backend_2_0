# Forgot Password Functionality

This document describes the complete forgot password implementation for both users and admins using OTP (One-Time Password) via email.

## 🚀 Features

- **Email-based OTP**: Secure 6-digit OTP sent via email
- **Time-limited OTP**: 10-minute expiration for security
- **Separate flows**: Different endpoints for users and admins
- **Email templates**: Professional HTML email templates
- **Validation**: Comprehensive input validation
- **Success notifications**: Email confirmation on password reset

## 📁 File Structure

```
backend/
├── controllers/
│   └── forgotPasswordController.js    # Main controller logic
├── routes/
│   └── forgotPassword.js              # API routes
├── utils/
│   └── emailService.js                # Email service with nodemailer
├── models/
│   ├── User.js                        # User model (already has reset fields)
│   └── Admin.js                       # Admin model (already has reset fields)
└── FORGOT_PASSWORD_README.md          # This file

frontend/src/
├── api/
│   └── forgotPasswordAPI.js           # Frontend API service
└── pages/
    └── Login.js                       # Updated with forgot password dialog

admin/src/
├── api/
│   └── forgotPasswordAPI.js           # Admin API service
└── pages/
    └── Login.js                       # Updated with forgot password dialog
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install nodemailer
```

### 2. Environment Configuration

Add the following to your `.env` file:

```env
# Email Configuration (for nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Use the app password** in your `.env` file

### 4. Alternative Email Services

You can use other email services by changing `EMAIL_SERVICE`:

```env
# For Outlook/Hotmail
EMAIL_SERVICE=outlook

# For Yahoo
EMAIL_SERVICE=yahoo

# For custom SMTP
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
```

## 📡 API Endpoints

### User Endpoints

| Method | Endpoint                                   | Description            |
| ------ | ------------------------------------------ | ---------------------- |
| POST   | `/api/forgot-password/user/send-otp`       | Send OTP to user email |
| POST   | `/api/forgot-password/user/verify-otp`     | Verify OTP             |
| POST   | `/api/forgot-password/user/reset-password` | Reset user password    |

### Admin Endpoints

| Method | Endpoint                                    | Description             |
| ------ | ------------------------------------------- | ----------------------- |
| POST   | `/api/forgot-password/admin/send-otp`       | Send OTP to admin email |
| POST   | `/api/forgot-password/admin/verify-otp`     | Verify OTP              |
| POST   | `/api/forgot-password/admin/reset-password` | Reset admin password    |

## 🔄 Flow Diagram

```
User clicks "Forgot Password"
         ↓
   Enter Email Address
         ↓
   Send OTP Request
         ↓
   Email sent with OTP
         ↓
   User enters OTP
         ↓
   Verify OTP
         ↓
   Enter New Password
         ↓
   Reset Password
         ↓
   Success Email sent
```

## 📝 API Request/Response Examples

### 1. Send OTP

**Request:**

```json
POST /api/forgot-password/user/send-otp
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

### 2. Verify OTP

**Request:**

```json
POST /api/forgot-password/user/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "abc123..."
}
```

### 3. Reset Password

**Request:**

```json
POST /api/forgot-password/user/reset-password
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## 🔒 Security Features

### OTP Security

- **6-digit numeric OTP**: Randomly generated
- **10-minute expiration**: Automatic cleanup
- **One-time use**: OTP is invalidated after use
- **In-memory storage**: OTPs stored in memory (not database)

### Password Security

- **User passwords**: Minimum 6 characters
- **Admin passwords**: Minimum 8 characters
- **Bcrypt hashing**: Automatic password hashing
- **Token cleanup**: Reset tokens cleared after use

### Email Security

- **Professional templates**: Branded email design
- **Security warnings**: Clear instructions in emails
- **No sensitive data**: OTPs sent separately from reset links

## 🎨 Email Templates

### OTP Email Features

- **BEATEN branding**: Consistent with your brand
- **Clear OTP display**: Large, easy-to-read OTP
- **Security warnings**: Important security notes
- **Professional design**: Responsive HTML template

### Success Email Features

- **Confirmation message**: Clear success notification
- **Security recommendations**: Password best practices
- **Support information**: Contact details if needed

## 🧪 Testing

### Test the Flow

1. **Start the backend server**:

   ```bash
   cd backend
   npm run dev
   ```

2. **Test with Postman or curl**:

   ```bash
   # Send OTP
   curl -X POST http://localhost:5000/api/forgot-password/user/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

3. **Check email** for the OTP

4. **Verify OTP**:

   ```bash
   curl -X POST http://localhost:5000/api/forgot-password/user/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "otp": "123456"}'
   ```

5. **Reset password**:
   ```bash
   curl -X POST http://localhost:5000/api/forgot-password/user/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "otp": "123456", "newPassword": "newpass123"}'
   ```

## 🚨 Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "User not found with this email address"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

## 🔧 Customization

### Email Template Customization

Edit `backend/utils/emailService.js` to customize:

- Email styling and branding
- OTP format and display
- Security messages
- Company information

### OTP Configuration

Modify OTP settings in `backend/controllers/forgotPasswordController.js`:

- OTP length (currently 6 digits)
- Expiration time (currently 10 minutes)
- Storage method (currently in-memory)

### Password Requirements

Update validation in routes:

- User password minimum length
- Admin password minimum length
- Additional password complexity rules

## 📱 Frontend Integration

### Frontend Usage

```javascript
import {
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
} from "../api/forgotPasswordAPI";

// Send OTP
const response = await sendForgotPasswordOTP(email);

// Verify OTP
const response = await verifyForgotPasswordOTP(email, otp);

// Reset password
const response = await resetPassword(email, otp, newPassword);
```

### Admin Panel Usage

```javascript
import {
  sendAdminForgotPasswordOTP,
  verifyAdminForgotPasswordOTP,
  resetAdminPassword,
} from "../api/forgotPasswordAPI";

// Send admin OTP
const response = await sendAdminForgotPasswordOTP(email);

// Verify admin OTP
const response = await verifyAdminForgotPasswordOTP(email, otp);

// Reset admin password
const response = await resetAdminPassword(email, otp, newPassword);
```

## 🚀 Production Considerations

### Email Service

- **Use production email service**: Consider services like SendGrid, Mailgun, or AWS SES
- **Email deliverability**: Ensure emails reach inbox, not spam
- **Rate limiting**: Implement email sending limits

### OTP Storage

- **Use Redis**: Replace in-memory storage with Redis for production
- **Database storage**: Consider storing OTPs in database with expiration
- **Distributed systems**: Ensure OTP storage works across multiple servers

### Security Enhancements

- **Rate limiting**: Limit OTP requests per email/IP
- **IP blocking**: Block suspicious IP addresses
- **Audit logging**: Log all password reset attempts
- **CAPTCHA**: Add CAPTCHA for OTP requests

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**:

   - Check email credentials in `.env`
   - Verify Gmail app password
   - Check email service configuration

2. **OTP not working**:

   - Check server time synchronization
   - Verify OTP storage is working
   - Check for typos in email/OTP

3. **Frontend not connecting**:
   - Verify API base URL
   - Check CORS configuration
   - Ensure backend server is running

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG=true
NODE_ENV=development
```

## 📞 Support

For issues or questions:

1. Check the error logs in the console
2. Verify all environment variables are set
3. Test the API endpoints directly
4. Check email service configuration

---

**Note**: This implementation uses in-memory OTP storage for simplicity. For production, consider using Redis or database storage for better scalability and persistence.
