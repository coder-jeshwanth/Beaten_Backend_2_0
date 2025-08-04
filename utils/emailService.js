const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    tls: {
    rejectUnauthorized: false, // 🔥 Allow self-signed certificate
  },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // use your new password here
    },
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send OTP email
// purpose: 'login' or 'reset' (default 'reset')
const sendOTPEmail = async (
  email,
  otp,
  userType = "user",
  purpose = "reset"
) => {
  try {
    const transporter = createTransporter();

    let subject, heading, message;
    if (purpose === "login") {
      subject = "Your BEATEN Login OTP";
      heading = "Login OTP";
      message = "Use the following OTP to log in to your account.";
    } else {
      subject =
        userType === "admin"
          ? "Admin Password Reset OTP - BEATEN"
          : "Password Reset OTP - BEATEN";
      heading = "Password Reset OTP";
      message = `We received a request to reset your password for your ${
        userType === "admin" ? "admin" : ""
      } account. Use the following OTP to complete the password reset process:`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${heading}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .otp-container {
            background-color: #f8f9fa;
            border: 2px solid #1a1a1a;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #1a1a1a;
            letter-spacing: 5px;
            margin: 10px 0;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #1a1a1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>${heading}</h2>
          </div>
          
          <p>Hello,</p>
          
          <p>${message}</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <p><strong>This OTP is valid for 10 minutes only.</strong></p>
          </div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This OTP will expire in 10 minutes</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this password reset, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <div class="footer">
            <p>Best regards,<br>The BEATEN Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

// Send contact form email to admin
const sendContactFormEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    const { name, email, subject, message } = contactData;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - BEATEN</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .contact-info {
            background-color: #f8f9fa;
            border-left: 4px solid #1a1a1a;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .contact-info h3 {
            margin-top: 0;
            color: #1a1a1a;
          }
          .contact-info p {
            margin: 8px 0;
          }
          .message-content {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            white-space: pre-wrap;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .timestamp {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>New Contact Form Submission</h2>
          </div>
          
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <h3>Message:</h3>
          <div class="message-content">
            ${message}
          </div>
          
          <div class="timestamp">
            <strong>Submitted on:</strong> ${new Date().toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              }
            )}
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the BEATEN contact form.</p>
            <p>Please respond to the customer's inquiry at your earliest convenience.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN Contact Form" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: process.env.ADMIN_CONTACT_MAIL || "laptoptest7788@gmail.com", // Admin email
      subject: `[Contact Form] ${subject} - From ${name}`,
      html: htmlContent,
      replyTo: email, // This allows admin to reply directly to the customer
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Contact form email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending contact form email: ", error);
    throw new Error("Failed to send contact form email");
  }
};

// Send password reset success email
const sendPasswordResetSuccessEmail = async (email, userType = "user") => {
  try {
    const transporter = createTransporter();

    const subject =
      userType === "admin"
        ? "Admin Password Reset Successful - BEATEN"
        : "Password Reset Successful - BEATEN";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <div class="success-icon">✅</div>
            <h2>Password Reset Successful</h2>
          </div>
          
          <p>Hello,</p>
          
          <p>Your ${
            userType === "admin" ? "admin" : ""
          } account password has been successfully reset.</p>
          
          <p>If you did not perform this action, please contact our support team immediately as your account may have been compromised.</p>
          
          <p>For security reasons, we recommend:</p>
          <ul>
            <li>Using a strong, unique password</li>
            <li>Enabling two-factor authentication if available</li>
            <li>Regularly updating your password</li>
          </ul>
          
          <div class="footer">
            <p>Best regards,<br>The BEATEN Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Success email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending success email: ", error);
    // Don't throw error for success email as it's not critical
    return false;
  }
};

// Send order status update email
const sendOrderStatusEmail = async (email, status, orderId, userName) => {
  try {
    const transporter = createTransporter();
    const statusMessages = {
      pending: "Your order is pending.",
      processing: "Your order is being processed.",
      shipped: "Your order has been shipped!",
      "out-for-delivery": "Your order is out for delivery!",
      delivered: "Your order has been delivered!",
      cancelled: "Your order has been cancelled.",
    };
    const subject = `Order #${orderId} Status Update: ${
      status.charAt(0).toUpperCase() + status.slice(1)
    }`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>Your order <b>#${orderId}</b> status has been updated to <b>${
      status.charAt(0).toUpperCase() + status.slice(1)
    }</b>.</p>
        <p>${statusMessages[status] || "Order status updated."}</p>
        <p>Thank you for shopping with BEATEN!</p>
        <hr style="margin: 32px 0;" />
        <p style="font-size: 13px; color: #888;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Order status email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending order status email:", error);
    return false;
  }
};

// Send order confirmed email with special styling
const sendOrderConfirmedEmail = async (email, orderId, userName) => {
  try {
    const transporter = createTransporter();
    const subject = `Order #${orderId} Confirmed! 🎉`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fffbe6; border-radius: 12px; border: 2px solid #ffe066; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
          <h1 style="color: #ff9900; margin-bottom: 8px;">Order Confirmed!</h1>
        </div>
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p style="font-size: 18px; color: #333;">We're excited to let you know that your order <b>#${orderId}</b> has been <b>confirmed</b> and is being prepared for shipment.</p>
        <ul style="font-size: 16px; color: #444; margin: 24px 0;">
          <li>You'll receive another email when your order ships.</li>
          <li>Track your order status anytime in your BEATEN account.</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://beaten.in/account/orders" style="background: #ff9900; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 18px; font-weight: bold;">View My Order</a>
        </div>
        <p style="font-size: 16px; color: #333;">Thank you for shopping with <b>BEATEN</b>!<br/>We appreciate your trust and support.</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #ffe066;" />
        <p style="font-size: 13px; color: #888; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "support@beaten.in"}>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmed email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending order confirmed email:", error);
    return false;
  }
};

// Send return placed email
const sendReturnPlacedEmail = async (
  email,
  userName,
  orderId,
  productId,
  reason
) => {
  try {
    const transporter = createTransporter();
    const subject = `Return Request Placed for Order #${orderId}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>We have received your return request for:</p>
        <ul>
          <li><b>Order ID:</b> ${orderId}</li>
          <li><b>Product ID:</b> ${productId}</li>
          <li><b>Reason:</b> ${reason}</li>
        </ul>
        <p>Our team will review your request and update you soon.</p>
        <p>Thank you for shopping with BEATEN!</p>
        <hr style="margin: 32px 0;" />
        <p style="font-size: 13px; color: #888;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Return placed email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending return placed email:", error);
    return false;
  }
};

// Send return status update email (approved/rejected)
const sendReturnStatusEmail = async (
  email,
  userName,
  orderId,
  productId,
  status
) => {
  try {
    const transporter = createTransporter();
    const statusText = status === "approved" ? "Approved" : "Rejected";
    const statusMsg =
      status === "approved"
        ? "Your return request has been approved. Please follow the instructions for returning your product."
        : "Your return request has been rejected. If you have questions, please contact support.";
    const subject = `Return Request ${statusText} for Order #${orderId}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>Your return request for:</p>
        <ul>
          <li><b>Order ID:</b> ${orderId}</li>
          <li><b>Product ID:</b> ${productId}</li>
        </ul>
        <p><b>Status:</b> ${statusText}</p>
        <p>${statusMsg}</p>
        <p>Thank you for shopping with BEATEN!</p>
        <hr style="margin: 32px 0;" />
        <p style="font-size: 13px; color: #888;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    const mailOptions = {
      from: `"BEATEN" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Return status email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending return status email:", error);
    return false;
  }
};

// ==================== ADMIN NOTIFICATION EMAILS ====================

// Send admin notification for new order
const sendAdminOrderNotification = async (orderData) => {
  try {
    const transporter = createTransporter();
    const {
      orderId,
      userName,
      userEmail,
      totalPrice,
      orderItems,
      shippingAddress,
    } = orderData;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification - BEATEN</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .order-info {
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .order-info h3 {
            margin-top: 0;
            color: #1a1a1a;
          }
          .order-items {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
          }
          .order-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .order-item:last-child {
            border-bottom: none;
          }
          .total {
            font-weight: bold;
            font-size: 18px;
            color: #1a1a1a;
            text-align: right;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #1a1a1a;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .timestamp {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>🛒 New Order Received</h2>
          </div>
          
          <div class="order-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
            <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
            <p><strong>Shipping Address:</strong></p>
            <p style="margin-left: 20px;">
              ${shippingAddress?.address || "N/A"}<br>
              ${shippingAddress?.city || ""}, ${shippingAddress?.state || ""} ${
      shippingAddress?.postalCode || ""
    }<br>
              ${shippingAddress?.country || "India"}
            </p>
          </div>
          
          <h3>Order Items:</h3>
          <div class="order-items">
            ${orderItems
              .map(
                (item) => `
              <div class="order-item">
                <div>
                  <strong>${item.name}</strong><br>
                  <small>Size: ${item.size || "N/A"} | Quantity: ${
                  item.quantity
                }</small>
                </div>
                <div>₹${item.price}</div>
              </div>
            `
              )
              .join("")}
            <div class="total">Total: ₹${totalPrice}</div>
          </div>
          
          <div class="timestamp">
            <strong>Order placed on:</strong> ${new Date().toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              }
            )}
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the BEATEN order system.</p>
            <p>Please process this order in your admin panel.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN Order System" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: process.env.ADMIN_ORDER_MAIL || "orders@beaten.in", // Admin email
      subject: `🛒 New Order #${orderId} - ${userName}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin order notification sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending admin order notification: ", error);
    return false; // Don't throw error as admin notification is not critical
  }
};

// Send admin notification for new user registration
const sendAdminRegistrationNotification = async (userData) => {
  try {
    const transporter = createTransporter();
    const { userName, userEmail, userPhone, userGender, userDob } = userData;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Registration - BEATEN</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .user-info {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .user-info h3 {
            margin-top: 0;
            color: #1a1a1a;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .timestamp {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>👤 New User Registration</h2>
          </div>
          
          <div class="user-info">
            <h3>User Details</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
            <p><strong>Phone:</strong> ${userPhone || "Not provided"}</p>
            <p><strong>Gender:</strong> ${userGender || "Not specified"}</p>
            <p><strong>Date of Birth:</strong> ${userDob || "Not provided"}</p>
          </div>
          
          <div class="timestamp">
            <strong>Registered on:</strong> ${new Date().toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              }
            )}
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the BEATEN registration system.</p>
            <p>New user has successfully registered on the platform.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN Registration System" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: process.env.EMAIL_USER || "laptoptest7788@gmail.com", // Admin email
      subject: `👤 New User Registration - ${userName}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin registration notification sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending admin registration notification: ", error);
    return false; // Don't throw error as admin notification is not critical
  }
};

// Send admin notification for order status updates
const sendAdminOrderStatusNotification = async (orderData) => {
  try {
    const transporter = createTransporter();
    const { orderId, userName, userEmail, oldStatus, newStatus } = orderData;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update - BEATEN</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .status-info {
            background-color: #f8f9fa;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .status-info h3 {
            margin-top: 0;
            color: #1a1a1a;
          }
          .status-change {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .timestamp {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>📦 Order Status Updated</h2>
          </div>
          
          <div class="status-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
          </div>
          
          <div class="status-change">
            <h3>Status Change</h3>
            <p><strong>From:</strong> ${oldStatus}</p>
            <p><strong>To:</strong> ${newStatus}</p>
          </div>
          
          <div class="timestamp">
            <strong>Updated on:</strong> ${new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the BEATEN order system.</p>
            <p>Order status has been updated by an admin.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN Order System" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: process.env.ADMIN_SHIPPING_MAIL || "laptoptest7788@gmail.com", // Admin email
      subject: `📦 Order Status Update #${orderId} - ${newStatus}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin order status notification sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending admin order status notification: ", error);
    return false; // Don't throw error as admin notification is not critical
  }
};

// Send admin notification for return requests
const sendAdminReturnNotification = async (returnData) => {
  try {
    const transporter = createTransporter();
    const { orderId, productId, userName, userEmail, reason } = returnData;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Return Request - BEATEN</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .return-info {
            background-color: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .return-info h3 {
            margin-top: 0;
            color: #1a1a1a;
          }
          .reason-box {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .timestamp {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>🔄 New Return Request</h2>
          </div>
          
          <div class="return-info">
            <h3>Return Details</h3>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Product ID:</strong> ${productId}</p>
            <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
          </div>
          
          <div class="reason-box">
            <h3>Return Reason</h3>
            <p>${reason}</p>
          </div>
          
          <div class="timestamp">
            <strong>Requested on:</strong> ${new Date().toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              }
            )}
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the BEATEN return system.</p>
            <p>Please review this return request in your admin panel.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"BEATEN Return System" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: process.env.ADMIN_RETURN_MAIL || "laptoptest7788@gmail.com", // Admin email
      subject: `🔄 New Return Request - Order #${orderId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin return notification sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending admin return notification: ", error);
    return false; // Don't throw error as admin notification is not critical
  }
};

// Send user notification email
const sendUserNotificationEmail = async (email, message, link = null) => {
  try {
    const transporter = createTransporter();
    const subject = "New Notification - BEATEN";
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Notification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .notification-message {
            font-size: 18px;
            margin: 20px 0;
            color: #222;
          }
          .notification-link {
            display: inline-block;
            background-color: #1a1a1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <h2>New Notification</h2>
          </div>
          <div class="notification-message">${message}</div>
          ${
            link
              ? `<div style='text-align:center;'><a class='notification-link' href='${link}'>View Details</a></div>`
              : ""
          }
          <div class="footer">
            <p>Best regards,<br>The BEATEN Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const mailOptions = {
      from: `"BEATEN" <${
        process.env.EMAIL_USER || "laptoptest7788@gmail.com"
      }>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("User notification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending user notification email:", error);
    throw new Error("Failed to send user notification email");
  }
};

// Send subscription reminder email
const sendSubscriptionReminderEmail = async (email, name, subscriptionEnd) => {
  try {
    const transporter = createTransporter();
    const subject = "Your BEATEN Subscription is Expiring Soon";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f7f8fa; border-radius: 12px; border: 2px solid #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
          <h1 style="color: #2563eb; margin-bottom: 8px;">Subscription Reminder</h1>
        </div>
        <h2 style="color: #1a1a1a;">Hi ${name || ""},</h2>
        <p style="font-size: 18px; color: #333;">This is a friendly reminder that your <b>BEATEN Premium</b> subscription will expire on <b>${new Date(
          subscriptionEnd
        ).toLocaleDateString()}</b>.</p>
        <ul style="font-size: 16px; color: #444; margin: 24px 0;">
          <li>Renew now to continue enjoying exclusive benefits and discounts.</li>
          <li>If you have already renewed, please ignore this message.</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://beaten.in/account/subscription" style="background: #2563eb; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 18px; font-weight: bold;">Renew Subscription</a>
        </div>
        <p style="font-size: 16px; color: #333;">Thank you for being a valued member of <b>BEATEN</b>!<br/>We appreciate your support.</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #2563eb;" />
        <p style="font-size: 13px; color: #888; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `;
    console.log(email, name, subscriptionEnd);

    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "support@beaten.in"}>`,
      to: email,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Subscription reminder email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending subscription reminder email:", error);
    return false;
  }
};

// @desc    Send subscription activation email
// @param   email - user email
// @param   name - user name
// @param   subscriptionType - yearly or monthly
// @param   subscriptionExpiry - expiry date
// @param   subscriptionCost - cost of subscription
const sendSubscriptionActivationEmail = async (
  email,
  name,
  subscriptionType,
  subscriptionExpiry,
  subscriptionCost
) => {
  try {
    const transporter = createTransporter();

    const expiryDate = new Date(subscriptionExpiry).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Activated - BEATEN</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 20px;
          }
          .subscription-details {
            background-color: #f8f9fa;
            border: 2px solid #1a1a1a;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: bold;
            color: #1a1a1a;
          }
          .detail-value {
            color: #666;
          }
          .cta-button {
            display: inline-block;
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEATEN</div>
            <div class="success-icon">🎉</div>
            <h1>Subscription Activated!</h1>
          </div>
          
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Great news! Your BEATEN premium subscription has been successfully activated. You now have access to exclusive benefits and discounts.</p>
          
          <div class="subscription-details">
            <div class="detail-row">
              <span class="detail-label">Subscription Type:</span>
              <span class="detail-value">${
                subscriptionType.charAt(0).toUpperCase() +
                subscriptionType.slice(1)
              }</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Activation Date:</span>
              <span class="detail-value">${new Date().toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expiry Date:</span>
              <span class="detail-value">${expiryDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Subscription Cost:</span>
              <span class="detail-value">₹${subscriptionCost}</span>
            </div>
          </div>
          
          <p>As a premium member, you'll enjoy:</p>
          <ul>
            <li>Exclusive discounts on all products</li>
            <li>Priority customer support</li>
            <li>Early access to new collections</li>
            <li>Free shipping on all orders</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/premium" class="cta-button">
              Explore Premium Benefits
            </a>
          </div>
          
          <p>Thank you for choosing BEATEN!</p>
          
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© 2024 BEATEN. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎉 Your BEATEN Premium Subscription is Now Active!",
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Subscription activation email sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("Error sending subscription activation email:", error);
    return false;
  }
};

module.exports = {
  generateOTP,
  generateResetToken,
  sendOTPEmail,
  sendContactFormEmail,
  sendPasswordResetSuccessEmail,
  sendOrderStatusEmail,
  sendOrderConfirmedEmail,
  sendReturnPlacedEmail,
  sendReturnStatusEmail,
  // Admin notification functions
  sendAdminOrderNotification,
  sendAdminRegistrationNotification,
  sendAdminOrderStatusNotification,
  sendAdminReturnNotification,
  sendUserNotificationEmail,
  sendSubscriptionReminderEmail,
  sendSubscriptionActivationEmail,
};
