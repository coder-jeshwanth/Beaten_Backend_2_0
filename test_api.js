const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing BEATEN Product API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log('');

    // Test 2: Get all products
    console.log('2. Testing get all products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`);
    console.log('✅ Products fetched successfully');
    console.log(`   Found ${productsResponse.data.data.length} products`);
    console.log(`   Total products: ${productsResponse.data.pagination.totalProducts}`);
    console.log('');

    // Test 3: Get categories
    console.log('3. Testing get categories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/products/categories`);
    console.log('✅ Categories fetched successfully');
    console.log(`   Categories: ${categoriesResponse.data.data.categories.length}`);
    console.log(`   Sub-categories: ${categoriesResponse.data.data.subCategories.length}`);
    console.log(`   Collections: ${categoriesResponse.data.data.collections.length}`);
    console.log('');

    // Test 4: Get featured products
    console.log('4. Testing get featured products...');
    const featuredResponse = await axios.get(`${API_BASE_URL}/products/featured`);
    console.log('✅ Featured products fetched successfully');
    console.log(`   Found ${featuredResponse.data.data.length} featured products`);
    console.log('');

    // Test 5: Get best sellers
    console.log('5. Testing get best sellers...');
    const bestSellersResponse = await axios.get(`${API_BASE_URL}/products/best-sellers`);
    console.log('✅ Best sellers fetched successfully');
    console.log(`   Found ${bestSellersResponse.data.data.length} best sellers`);
    console.log('');

    // Test 6: Get new arrivals
    console.log('6. Testing get new arrivals...');
    const newArrivalsResponse = await axios.get(`${API_BASE_URL}/products/new-arrivals`);
    console.log('✅ New arrivals fetched successfully');
    console.log(`   Found ${newArrivalsResponse.data.data.length} new arrivals`);
    console.log('');

    // Test 7: Search products
    console.log('7. Testing search products...');
    const searchResponse = await axios.get(`${API_BASE_URL}/products/search?q=premium`);
    console.log('✅ Search products fetched successfully');
    console.log(`   Found ${searchResponse.data.data.length} products matching "premium"`);
    console.log('');

    // Test 8: Get products by category
    console.log('8. Testing get products by category...');
    const categoryResponse = await axios.get(`${API_BASE_URL}/products/category/T-shirts`);
    console.log('✅ Products by category fetched successfully');
    console.log(`   Found ${categoryResponse.data.data.length} T-shirts`);
    console.log('');

    // Test 9: Get products by gender
    console.log('9. Testing get products by gender...');
    const genderResponse = await axios.get(`${API_BASE_URL}/products/gender/MEN`);
    console.log('✅ Products by gender fetched successfully');
    console.log(`   Found ${genderResponse.data.data.length} men's products`);
    console.log('');

    // Test 10: Get products by collection
    console.log('10. Testing get products by collection...');
    const collectionResponse = await axios.get(`${API_BASE_URL}/products/collection/Beaten%20Exclusive%20Collection`);
    console.log('✅ Products by collection fetched successfully');
    console.log(`   Found ${collectionResponse.data.data.length} products in "Beaten Exclusive Collection"`);
    console.log('');

    // Test 11: Get single product (if products exist)
    if (productsResponse.data.data.length > 0) {
      const firstProduct = productsResponse.data.data[0];
      console.log('11. Testing get single product...');
      const singleProductResponse = await axios.get(`${API_BASE_URL}/products/${firstProduct._id}`);
      console.log('✅ Single product fetched successfully');
      console.log(`   Product: ${singleProductResponse.data.data.name}`);
      console.log(`   Price: ₹${singleProductResponse.data.data.price}`);
      console.log('');
    }

    console.log('🎉 All API tests passed successfully!');
    console.log('✅ Backend is ready for frontend integration');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
  }
}

// Run the test
testAPI(); 