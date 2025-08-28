const { generateInvoicePDF } = require('./utils/emailService');
const fs = require('fs');

// Test data to verify the new invoice format
const testOrder = {
  orderId: 'BT-2025-001',
  invoiceId: 'INV-2025-001',
  createdAt: new Date(),
  totalPrice: 2950,
  orderItems: [
    {
      name: 'BEATEN Premium Cotton T-Shirt',
      sku: 'BT-TSH-001',
      price: 1299,
      quantity: 2,
      gst: 234,
      size: 'L',
      color: 'Black'
    },
    {
      name: 'BEATEN Casual Jeans',
      sku: 'BT-JNS-002', 
      price: 1899,
      quantity: 1,
      gst: 342,
      size: '32',
      color: 'Blue'
    }
  ],
  paymentInfo: {
    method: 'UPI'
  },
  awbNumber: 'AWB123456789',
  coupon: {
    discountAmount: 100
  }
};

const testShippingAddress = {
  fullName: 'Rahul Sharma',
  addressLine1: '123 MG Road',
  addressLine2: 'Near City Mall',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560001',
  phoneNumber: '+91-9876543210'
};

// Test the new invoice generation
async function testInvoice() {
  try {
    console.log('Testing new BEATEN invoice format...');
    
    // This would normally be called from the email service
    // We're just testing the format here
    const pdfBuffer = await generateInvoicePDF(testOrder, testShippingAddress);
    
    // Save test invoice to verify format
    fs.writeFileSync('./test_invoice.pdf', pdfBuffer);
    console.log('✅ Test invoice generated successfully!');
    console.log('📄 Check test_invoice.pdf to see the new format');
    console.log('🎨 Features implemented:');
    console.log('   - Professional BEATEN branding with #FF6B35 color');
    console.log('   - Clean modern layout with proper spacing');
    console.log('   - Organized sections with styled boxes');
    console.log('   - Enhanced typography and readability');
    console.log('   - QR codes for website and social media');
    console.log('   - Proper tax breakdown (CGST/SGST/IGST)');
    console.log('   - Branded footer with company details');
    
  } catch (error) {
    console.error('❌ Error testing invoice:', error.message);
  }
}

if (require.main === module) {
  testInvoice();
}

module.exports = { testInvoice };
