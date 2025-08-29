const fs = require('fs');
const path = require('path');
const { generateInvoicePDF } = require('./utils/emailService');

// Test function to generate PDF without sending email
async function testPDFGeneration() {
  try {
    // Create a mock order object with all the required fields
    const mockOrder = {
      orderId: 'ORD123456789',
      invoiceId: 'INV-12345678-123',
      createdAt: new Date(),
      orderItems: [
        {
          product: '5f7a14d57a7e1c0017b23456',
          name: 'Test Product',
          quantity: 2,
          price: 1500, // Price including GST
          image: 'https://beaten.in/images/product.jpg',
          size: 'L',
          color: 'Black'
        }
      ],
      totalPrice: 3000,
      coupon: {
        code: 'TEST10',
        discountType: 'percentage',
        discount: 10,
        discountAmount: 300
      },
      subscriptionDiscount: {
        applied: true,
        amount: 249,
        subscriptionCost: 249
      },
      shippingAddress: {
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'Karnataka',
        pincode: '560001',
        phoneNumber: '9876543210',
        name: 'Test User'
      }
    };

    // Generate the PDF
    console.log('Generating test PDF...');
    const pdfBuffer = await generateInvoicePDF(mockOrder, mockOrder.shippingAddress);
    
    // Save the PDF to a file
    const testFilePath = path.join(__dirname, 'test_invoice.pdf');
    fs.writeFileSync(testFilePath, pdfBuffer);
    console.log(`Test PDF saved to: ${testFilePath}`);
    
    return true;
  } catch (error) {
    console.error('Error generating test PDF:', error);
    return false;
  }
}

// Run the test
testPDFGeneration()
  .then(result => {
    console.log('Test completed with result:', result);
    process.exit(result ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
