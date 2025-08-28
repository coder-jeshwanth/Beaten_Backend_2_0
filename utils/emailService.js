const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Generate Invoice PDF
const generateInvoicePDF = async (order, shippingAddress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN");
      const currentDate = new Date().toLocaleDateString("en-IN");
      
      // Calculate totals and taxes
      const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalGST = order.orderItems.reduce((sum, item) => sum + (item.gst * item.quantity), 0);
      const discountAmount = order.coupon?.discountAmount || 0;
      const subscriptionDiscount = order.subscriptionDiscount?.amount || 0;
      const totalDiscount = discountAmount + subscriptionDiscount;
      
      // Calculate tax breakdown
      const isInterState = shippingAddress.state !== 'Karnataka';
      const cgst = isInterState ? 0 : totalGST / 2;
      const sgst = isInterState ? 0 : totalGST / 2;
      const igst = isInterState ? totalGST : 0;
      
      // Create PDF document
      const doc = new PDFDocument({margin: 0, size: 'A4'});
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));
      
      // Page dimensions
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 20;
      
      // Helper function to draw border
      const drawBorder = (x, y, width, height) => {
        doc.rect(x, y, width, height).stroke('#000000');
      };
      
      // HEADER SECTION
      const headerHeight = 80;
      drawBorder(margin, margin, pageWidth - 2 * margin, headerHeight);
      
      // Left section - Seller details
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
      doc.text('Seller/Consignor: Beaten apparels', margin + 10, margin + 15);
      doc.fontSize(9).font('Helvetica');
      doc.text('Plot NO 91, Block B, Road NO-4,', margin + 10, margin + 30);
      doc.text('Siddhartha Enclave, Patelguda,', margin + 10, margin + 42);
      doc.text('Beeramguda, Pincode : 502319', margin + 10, margin + 54);
      
      // Center section - TAX INVOICE
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('TAX INVOICE', pageWidth/2, margin + 35, {align: 'center'});
      
      // Right section - BEATEN brand and contact
      doc.fontSize(24).font('Helvetica-Bold');
      doc.text('BEATEN', pageWidth - 120, margin + 15);
      doc.fontSize(9).font('Helvetica');
      doc.text('Customer Support: +91 7799120325', pageWidth - 150, margin + 45);
      doc.text('Email: customerSupport@beaten.in', pageWidth - 150, margin + 57);
      
      // Bottom bar under header
      const bottomBarY = margin + headerHeight;
      drawBorder(margin, bottomBarY, pageWidth - 2 * margin, 20);
      doc.fontSize(9).font('Helvetica');
      doc.text('GSTIN: 36ABEFB6155C1ZQ', margin + 10, bottomBarY + 6);
      doc.text(`Dated: ${currentDate}`, pageWidth - 120, bottomBarY + 6);
      
      // MAIN CONTENT SECTION
      const contentY = bottomBarY + 20;
      const contentHeight = 400;
      drawBorder(margin, contentY, pageWidth - 2 * margin, contentHeight);
      
      // Recipient Address
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Recipient Address: ${shippingAddress.fullName}`, margin + 10, contentY + 15);
      doc.fontSize(9).font('Helvetica');
      doc.text(shippingAddress.addressLine1, margin + 10, contentY + 30);
      if (shippingAddress.addressLine2) {
        doc.text(shippingAddress.addressLine2, margin + 10, contentY + 42);
        doc.text(`${shippingAddress.city}, ${shippingAddress.state}`, margin + 10, contentY + 54);
        doc.text(`Pin: ${shippingAddress.pincode}`, margin + 10, contentY + 66);
        doc.text(`Mobile NO: ${shippingAddress.phoneNumber}`, margin + 10, contentY + 78);
      } else {
        doc.text(`${shippingAddress.city}, ${shippingAddress.state}`, margin + 10, contentY + 42);
        doc.text(`Pin: ${shippingAddress.pincode}`, margin + 10, contentY + 54);
        doc.text(`Mobile NO: ${shippingAddress.phoneNumber}`, margin + 10, contentY + 66);
      }
      
      // Order Information
      const orderInfoY = contentY + 100;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`ORDER NUMBER: ${order.orderId}`, margin + 10, orderInfoY);
      doc.fontSize(9).font('Helvetica');
      doc.text('Carrier Name: DELHIVERY', margin + 10, orderInfoY + 15);
      
      // Right side order info
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Mode Of Payment: ${order.paymentInfo?.method === 'COD' ? 'COD' : 'NONCOD'}`, pageWidth - 200, orderInfoY);
      doc.fontSize(9).font('Helvetica');
      doc.text(`AWB Number: ${order.awbNumber || 'Not Available'}`, pageWidth - 200, orderInfoY + 15);
      
      // Product Table
      const tableY = orderInfoY + 40;
      const tableHeaders = ['Description', 'SKU', 'HSN', 'Qty', 'Rate', 'Amount', 'Total'];
      const colWidths = [120, 80, 50, 40, 60, 60, 60];
      let colX = margin + 10;
      
      // Table header
      doc.fontSize(9).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.rect(colX, tableY, colWidths[i], 20).stroke('#000000');
        doc.text(header, colX + 5, tableY + 6, {width: colWidths[i] - 10, align: 'center'});
        colX += colWidths[i];
      });
      
      // Table rows
      let rowY = tableY + 20;
      doc.fontSize(9).font('Helvetica');
      
      order.orderItems.forEach((item) => {
        colX = margin + 10;
        const itemAmount = item.price * item.quantity;
        const itemTotal = itemAmount + (item.gst * item.quantity);
        
        // Draw row
        doc.rect(colX, rowY, colWidths[0], 25).stroke('#000000');
        doc.text(item.name, colX + 5, rowY + 8, {width: colWidths[0] - 10, align: 'left'});
        colX += colWidths[0];
        
        doc.rect(colX, rowY, colWidths[1], 25).stroke('#000000');
        doc.text(item.sku || 'BT-001', colX + 5, rowY + 8, {width: colWidths[1] - 10, align: 'center'});
        colX += colWidths[1];
        
        doc.rect(colX, rowY, colWidths[2], 25).stroke('#000000');
        doc.text('6109', colX + 5, rowY + 8, {width: colWidths[2] - 10, align: 'center'});
        colX += colWidths[2];
        
        doc.rect(colX, rowY, colWidths[3], 25).stroke('#000000');
        doc.text(item.quantity.toString(), colX + 5, rowY + 8, {width: colWidths[3] - 10, align: 'center'});
        colX += colWidths[3];
        
        doc.rect(colX, rowY, colWidths[4], 25).stroke('#000000');
        doc.text(`₹${item.price}`, colX + 5, rowY + 8, {width: colWidths[4] - 10, align: 'center'});
        colX += colWidths[4];
        
        doc.rect(colX, rowY, colWidths[5], 25).stroke('#000000');
        doc.text(`₹${(item.gst * item.quantity).toFixed(2)}`, colX + 5, rowY + 8, {width: colWidths[5] - 10, align: 'center'});
        colX += colWidths[5];
        
        doc.rect(colX, rowY, colWidths[6], 25).stroke('#000000');
        doc.text(`₹${itemTotal}`, colX + 5, rowY + 8, {width: colWidths[6] - 10, align: 'center'});
        
        rowY += 25;
      });
      
      // Tax & Totals Table
      const totalsY = rowY + 20;
      const totalsWidth = 200;
      const totalsX = pageWidth - margin - totalsWidth;
      
      // CGST
      doc.rect(totalsX, totalsY, totalsWidth/2, 20).stroke('#000000');
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('CGST', totalsX + 5, totalsY + 6, {align: 'right', width: totalsWidth/2 - 10});
      doc.rect(totalsX + totalsWidth/2, totalsY, totalsWidth/2, 20).stroke('#000000');
      doc.text(`₹${cgst.toFixed(2)}`, totalsX + totalsWidth/2 + 5, totalsY + 6, {align: 'right', width: totalsWidth/2 - 10});
      
      // SGST
      doc.rect(totalsX, totalsY + 20, totalsWidth/2, 20).stroke('#000000');
      doc.text('SGST', totalsX + 5, totalsY + 26, {align: 'right', width: totalsWidth/2 - 10});
      doc.rect(totalsX + totalsWidth/2, totalsY + 20, totalsWidth/2, 20).stroke('#000000');
      doc.text(`₹${sgst.toFixed(2)}`, totalsX + totalsWidth/2 + 5, totalsY + 26, {align: 'right', width: totalsWidth/2 - 10});
      
      // IGST
      doc.rect(totalsX, totalsY + 40, totalsWidth/2, 20).stroke('#000000');
      doc.text('IGST', totalsX + 5, totalsY + 46, {align: 'right', width: totalsWidth/2 - 10});
      doc.rect(totalsX + totalsWidth/2, totalsY + 40, totalsWidth/2, 20).stroke('#000000');
      doc.text(igst > 0 ? `₹${igst.toFixed(2)}` : '-', totalsX + totalsWidth/2 + 5, totalsY + 46, {align: 'right', width: totalsWidth/2 - 10});
      
      // Total Amount
      doc.rect(totalsX, totalsY + 60, totalsWidth/2, 20).stroke('#000000');
      doc.text('Total Amount', totalsX + 5, totalsY + 66, {align: 'right', width: totalsWidth/2 - 10});
      doc.rect(totalsX + totalsWidth/2, totalsY + 60, totalsWidth/2, 20).stroke('#000000');
      doc.text(`₹${order.totalPrice}`, totalsX + totalsWidth/2 + 5, totalsY + 66, {align: 'right', width: totalsWidth/2 - 10});
      
      // FOOTER SECTION
      const footerY = contentY + contentHeight;
      const footerHeight = 200;
      drawBorder(margin, footerY, pageWidth - 2 * margin, footerHeight);
      
      // QR Codes section
      try {
        // Website QR Code
        const websiteQR = await QRCode.toBuffer('https://beaten.in', { 
          width: 60, 
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        doc.image(websiteQR, margin + 80, footerY + 20, { width: 60, height: 60 });
        
        // Social Media QR Code
        const socialQR = await QRCode.toBuffer('https://instagram.com/beaten.official', { 
          width: 60, 
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        doc.image(socialQR, margin + 250, footerY + 20, { width: 60, height: 60 });
        
        // QR labels
        doc.fontSize(9).font('Helvetica');
        doc.text('Visit Website', margin + 70, footerY + 85, {width: 80, align: 'center'});
        doc.text('Follow Us', margin + 240, footerY + 85, {width: 80, align: 'center'});
        
      } catch (qrError) {
        console.error('QR Code generation error:', qrError);
      }
      
      // Thank you message
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000');
      doc.text('Thank You For shopping with BEATEN', margin + 20, footerY + 110, {width: pageWidth - 40, align: 'center'});
      
      // Disclaimer
      doc.fontSize(10).font('Helvetica').fillColor('#000000');
      doc.text('Products being sent under this invoice are for personal consumption of the customer and not for re-sale or commercial purposes.', margin + 20, footerY + 130, {width: pageWidth - 40, align: 'center'});
      doc.text('This is an electronically generated document issued in accordance with the provisions of the Information Technology Act, 2000 (21 of 2000) and does not require a physical signature.', margin + 20, footerY + 150, {width: pageWidth - 40, align: 'center'});
      
      // Registered office
      doc.fontSize(9).font('Helvetica');
      doc.text('Regd Office: Beaten Apparels Plot NO 91, Block B, Road NO-4, Siddartha Enclave, Patelguda, Beeramguda, Pincode : 502319', margin + 20, footerY + 175, {width: pageWidth - 40, align: 'center'});
      
      // Tagline and website
      doc.fontSize(9).font('Helvetica-Oblique'); // Use Oblique for italic
      doc.text('Elevate your look with BEATEN.....', margin + 20, footerY + 190);
      doc.fontSize(9).font('Helvetica');
      doc.text('www.beaten.in', pageWidth - 100, footerY + 190);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate Invoice HTML (keep for backward compatibility)
const generateInvoiceHTML = (order, shippingAddress) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN");
  const currentDate = new Date().toLocaleDateString("en-IN");
  
  // Calculate totals
  const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalGST = order.orderItems.reduce((sum, item) => sum + (item.gst * item.quantity), 0);
  const discountAmount = order.coupon?.discountAmount || 0;
  const subscriptionDiscount = order.subscriptionDiscount?.amount || 0;
  const totalDiscount = discountAmount + subscriptionDiscount;
  
  // Calculate if inter-state transaction for tax calculation
  const isInterState = shippingAddress.state !== 'Karnataka';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${order.invoiceId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', Arial, sans-serif; background: #ffffff; color: #333; line-height: 1.4; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px; }
        
        /* Header Section */
        .header-section { background: #FF6B35; color: white; padding: 30px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
        .company-brand { font-size: 36px; font-weight: bold; }
        .company-subtitle { font-size: 14px; font-weight: bold; margin-top: 5px; }
        .invoice-title { font-size: 28px; font-weight: bold; text-align: right; }
        
        /* Company Details */
        .company-details { background: #f8f9fa; padding: 20px; border: 1px solid #e5e5e5; display: flex; justify-content: space-between; }
        .company-info h3 { color: #333; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
        .company-info p { font-size: 10px; margin: 3px 0; }
        .invoice-info h3 { color: #333; font-size: 11px; font-weight: bold; margin-bottom: 10px; }
        .invoice-info p { font-size: 10px; margin: 3px 0; }
        
        /* Billing Section */
        .billing-section { display: flex; gap: 20px; margin: 20px 0; }
        .billing-box { flex: 1; background: #f8f9fa; padding: 20px; border: 1px solid #e5e5e5; border-radius: 4px; }
        .billing-box h3 { color: #333; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
        .billing-box p { font-size: 10px; margin: 3px 0; }
        
        /* Table Styles */
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th { background: #f8f9fa; color: #333; font-weight: bold; font-size: 11px; padding: 12px 8px; border: 1px solid #e5e5e5; text-align: center; }
        .invoice-table td { font-size: 10px; padding: 12px 8px; border: 1px solid #e5e5e5; text-align: center; }
        .invoice-table tr:nth-child(even) { background: #f9f9f9; }
        .invoice-table tr:nth-child(odd) { background: #ffffff; }
        .invoice-table .description { text-align: left; }
        
        /* Totals Section */
        .totals-section { float: right; width: 300px; margin-top: 20px; background: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 4px; }
        .totals-header { background: #FF6B35; color: white; padding: 15px; font-size: 14px; font-weight: bold; text-align: center; }
        .totals-content { padding: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px; }
        .total-row.final { font-weight: bold; font-size: 13px; background: #FF6B35; color: white; margin: 10px -20px -20px -20px; padding: 15px 20px; }
        
        /* Footer */
        .footer-section { clear: both; background: #f8f9fa; padding: 25px; margin-top: 40px; border: 1px solid #e5e5e5; border-radius: 4px; text-align: center; }
        .thank-you { color: #FF6B35; font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .disclaimer { font-size: 10px; color: #666; margin: 10px 0; }
        .company-footer { font-size: 8px; color: #999; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header Section -->
        <div class="header-section">
          <div>
            <div class="company-brand">BEATEN</div>
            <div class="company-subtitle">PRIVATE LIMITED</div>
          </div>
          <div class="invoice-title">TAX INVOICE</div>
        </div>
        
        <!-- Company Details -->
        <div class="company-details">
          <div class="company-info">
            <h3>SELLER / CONSIGNOR DETAILS:</h3>
            <p>Address: 123 Fashion Street, Bangalore, Karnataka 560001</p>
            <p>GSTIN: 29AABCB1234C1Z5 | Email: support@beaten.in | Phone: +91-9876543210</p>
          </div>
          <div class="invoice-info">
            <h3>INVOICE DETAILS:</h3>
            <p><strong>Invoice No:</strong> ${order.invoiceId || order.orderId}</p>
            <p><strong>Invoice Date:</strong> ${currentDate}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
          </div>
        </div>
        
        <!-- Billing Section -->
        <div class="billing-section">
          <div class="billing-box">
            <h3>BILL TO / CONSIGNEE DETAILS:</h3>
            <p><strong>${shippingAddress.fullName}</strong></p>
            <p>${shippingAddress.addressLine1}</p>
            ${shippingAddress.addressLine2 ? `<p>${shippingAddress.addressLine2}</p>` : ''}
            <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}</p>
          </div>
          <div class="billing-box">
            <h3>ORDER & PAYMENT DETAILS:</h3>
            <p><strong>Phone:</strong> ${shippingAddress.phoneNumber}</p>
            <p><strong>Payment Mode:</strong> ${order.paymentInfo?.method || 'PREPAID'}</p>
            <p><strong>AWB/Tracking:</strong> ${order.awbNumber || 'N/A'}</p>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
          </div>
        </div>

        <!-- Product Table -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th class="description">DESCRIPTION</th>
              <th>SKU</th>
              <th>HSN</th>
              <th>QTY</th>
              <th>RATE (₹)</th>
              <th>AMOUNT (₹)</th>
              <th>TOTAL (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map(item => {
              const itemAmount = item.price * item.quantity;
              const itemTotal = itemAmount + (item.gst * item.quantity);
              return `
                <tr>
                  <td class="description">${item.name}</td>
                  <td>${item.sku || 'BT-001'}</td>
                  <td>6109</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${itemAmount.toFixed(2)}</td>
                  <td>${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-header">AMOUNT SUMMARY</div>
          <div class="totals-content">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            ${isInterState ? 
              `<div class="total-row"><span>IGST (18%):</span><span>₹${totalGST.toFixed(2)}</span></div>` :
              `<div class="total-row"><span>CGST (9%):</span><span>₹${(totalGST/2).toFixed(2)}</span></div>
               <div class="total-row"><span>SGST (9%):</span><span>₹${(totalGST/2).toFixed(2)}</span></div>`
            }
            ${totalDiscount > 0 ? 
              `<div class="total-row"><span>Discount:</span><span>-₹${totalDiscount.toFixed(2)}</span></div>` : ''
            }
            <div class="total-row final">
              <span>TOTAL AMOUNT:</span>
              <span>₹${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-section">
          <div class="thank-you">Thank You for choosing BEATEN!</div>
          <div class="disclaimer">Products are for personal consumption only and not for resale.</div>
          <div class="disclaimer">For returns & exchanges, visit beaten.in/policy</div>
          <div class="company-footer">
            Registered Office: BEATEN Private Limited, 123 Fashion Street, Bangalore, Karnataka 560001
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

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
const sendOrderStatusEmail = async (email, status, orderId, userName, orderData = null) => {
  try {
    const transporter = createTransporter();
    const statusMessages = {
      pending: "Your order is pending.",
      processing: "Your order is being processed.",
      shipped: "Your order has been shipped!",
      "out-for-delivery": "Your order is out for delivery!",
      delivered: "Your order has been delivered!",
      cancelled: "Your order has been cancelled.",
      return_approved: "Your return request has been approved!",
      return_rejected: "Your return request has been rejected.",
      return_completed: "Your return has been completed successfully!",
    };
    
    const subject = `Order #${orderId} Status Update: ${
      status.charAt(0).toUpperCase() + status.slice(1)
    }`;
    
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>Your order <b>#${orderId}</b> status has been updated to <b>${
      status.charAt(0).toUpperCase() + status.slice(1)
    }</b>.</p>
        <p>${statusMessages[status] || "Order status updated."}</p>
        ${status === 'delivered' ? '<p><strong>Your invoice is attached to this email for your records.</strong></p>' : ''}
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

    // If status is delivered and order data is provided, attach invoice as PDF
    if (status === 'delivered' && orderData && orderData.shippingAddress) {
      try {
        // Generate PDF invoice
        const pdfBuffer = await generateInvoicePDF(orderData, orderData.shippingAddress);
        
        // Attach the PDF to the email
        mailOptions.attachments = [
          {
            filename: `Invoice_${orderData.invoiceId || orderId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ];
      } catch (invoiceError) {
        console.error("Error generating PDF invoice:", invoiceError);
        console.error("PDF generation failed. Email will be sent without invoice attachment.");
        // Continue sending email without invoice if PDF generation fails
      }
    }

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
    
    // Get order and product details
    const Order = require("../models/Order");
    const Product = require("../models/Product");
    
    let humanReadableOrderId = orderId;
    let productName = "Product";
    
    try {
      const order = await Order.findById(orderId);
      if (order && order.orderId) {
        humanReadableOrderId = order.orderId;
      }
    } catch (e) {
      console.log("Could not fetch order details:", e.message);
    }
    
    try {
      const product = await Product.findById(productId);
      if (product && product.name) {
        productName = product.name;
      }
    } catch (e) {
      console.log("Could not fetch product details:", e.message);
    }
    
    const subject = `Return Request Placed for Order #${humanReadableOrderId}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>We have received your return request for:</p>
        <ul>
          <li><b>Order ID:</b> ${humanReadableOrderId}</li>
          <li><b>Product:</b> ${productName}</li>
          <li><b>Reason:</b> ${reason}</li>
        </ul>
        <p>Our team will review your request and update you soon.</p>
        
        <div style="margin: 32px 0; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h3 style="color: #1a1a1a; margin-top: 0;">📜 Beaten – Return & Refund Policy</h3>
          <p>At Beaten, we want you to love what you wear. If something doesn't fit or meet your expectations, we're here to help.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
          
          <h4 style="color: #1a1a1a;">🔄 Returns & Exchanges</h4>
          <ul>
            <li>Returns/exchanges are accepted within 7 days of delivery.</li>
            <li>Products must be unused, unwashed, with original tags & packaging.</li>
            <li>Once we receive the returned product and complete our Quality Check (QC), we will process your request.</li>
          </ul>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
          
          <h4 style="color: #1a1a1a;">💳 Refunds for Prepaid Orders</h4>
          <ul>
            <li>For prepaid (online payment) orders, refunds are processed to the original payment method within 5–7 working days after QC.</li>
          </ul>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
          
          <h4 style="color: #1a1a1a;">💰 Refunds for COD Orders</h4>
          <p>Since COD orders are paid in cash to the courier, we cannot issue cash refunds at the doorstep. Instead:</p>
          <ul>
            <li>Refunds will be made via UPI / Bank Transfer only.</li>
            <li>Once your return is approved, our support team will contact you to collect your UPI ID or bank account details.</li>
            <li>Refunds will be processed within 5–7 working days after QC.</li>
          </ul>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
          
          <h4 style="color: #1a1a1a;">🔁 Exchange Option</h4>
          <ul>
            <li>If you prefer, instead of a refund, you can request an exchange for a different size/product (subject to stock availability).</li>
            <li>Exchange shipping charges may apply for COD customers.</li>
          </ul>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
          
          <h4 style="color: #1a1a1a;">🚫 Non-Returnable Items</h4>
          <ul>
            <li>Innerwear, socks, and accessories are not eligible for return/exchange for hygiene reasons.</li>
          </ul>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
          
          <h4 style="color: #1a1a1a;">📞 Need Help?</h4>
          <p>For any return or refund queries, contact us at:</p>
          <p>📧 support@beaten.in | 📱 +91 7799120325</p>
        </div>
        
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
    
    // Get product details for all statuses
    let productName = productId; // Default fallback
    try {
      const Product = require("../models/Product");
      const product = await Product.findById(productId);
      if (product && product.name) {
        productName = product.name;
      }
    } catch (e) {
      console.log("Could not fetch product details:", e.message);
    }
    
    let statusText, statusMsg;
    
    switch (status) {
      case "approved":
        statusText = "Approved";
        statusMsg = "Your return request has been approved. Please follow the instructions for returning your product.";
        break;
      case "rejected":
        statusText = "Rejected";
        statusMsg = "Your return request has been rejected. If you have questions, please contact support.";
        break;
      case "return_rejected":
        statusText = "Rejected";
        statusMsg = "Your return request has been rejected after review. If you have questions, please contact support.";
        break;
      case "completed":
        statusText = "Completed";
        statusMsg = "Your return has been successfully completed and processed. Thank you for choosing BEATEN!";
        break;
      case "pending":
        statusText = "Under Review";
        statusMsg = "Your return request is currently under review. We will update you soon.";
        break;
      default:
        statusText = "Updated";
        statusMsg = "Your return request status has been updated. Please contact support for more information.";
    }
    
    const subject = `Return Request ${statusText} for Order #${orderId}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
        <h2 style="color: #1a1a1a;">Hi ${userName || ""},</h2>
        <p>Your return request for:</p>
        <ul>
          <li><b>Order ID:</b> ${orderId}</li>
          <li><b>Product:</b> ${productName}</li>
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
    console.log("Mail Called")
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
        process.env.EMAIL_USER || "support@beaten.in"
      }>`,
      to: process.env.ADMIN_RETURN_MAIL || "returns@beaten.in", // Admin email
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

// Send custom message email to subscribers
const sendCustomMessageEmail = async (email, name, subject, message, includeUnsubscribeLink = true) => {
  try {
    const transporter = createTransporter();
    
    // Create unsubscribe link (you may want to implement actual unsubscribe functionality)
    const unsubscribeSection = includeUnsubscribeLink ? `
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #FF6B35;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        If you don't want to receive these emails, you can 
        <a href="https://beaten.in/unsubscribe?email=${encodeURIComponent(email)}" style="color: #FF6B35;">unsubscribe here</a>.
      </p>
    ` : '';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 2px solid #FF6B35; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #FF6B35; margin-bottom: 8px; font-size: 28px;">BEATEN</h1>
          <div style="width: 60px; height: 3px; background: #FF6B35; margin: 0 auto;"></div>
        </div>
        
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Hi ${name || "Valued Customer"},</h2>
        
        <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #FF6B35;">
          ${message.split('\n').map(paragraph => `<p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 16px;">${paragraph}</p>`).join('')}
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://beaten.in" style="background: #FF6B35; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">Visit BEATEN</a>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center;">
          Thank you for being a valued member of <strong>BEATEN</strong>!<br/>
          We appreciate your continued support.
        </p>
        
        ${unsubscribeSection}
        
        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 16px;">
          This email was sent to you because you are a BEATEN subscriber.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"BEATEN" <${process.env.EMAIL_USER || "support@beaten.in"}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Custom message email sent to ${email}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`Error sending custom message email to ${email}:`, error);
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
  sendCustomMessageEmail,
  sendSubscriptionActivationEmail,
};
