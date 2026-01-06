const axios = require('axios');

async function testProductAPI() {
  try {
    const productId = 14;

    console.log(`\n📦 Testing Product API for ID: ${productId}\n`);

    // Test 1: Get product details
    console.log('Test 1: GET /api/products/' + productId);
    const productResponse = await axios.get(`https://greenart81-backend.onrender.com/api/products/${productId}`);
    const product = productResponse.data.data;

    console.log('✅ Product Name:', product.name);
    console.log('✅ Has images array:', !!product.images);
    console.log('✅ Images count:', product.images?.length || 0);
    if (product.images && product.images.length > 0) {
      console.log('✅ Images:', JSON.stringify(product.images, null, 2));
    }

    // Test 2: Get product images
    console.log('\nTest 2: GET /api/products/' + productId + '/images');
    const imagesResponse = await axios.get(`https://greenart81-backend.onrender.com/api/products/${productId}/images`);

    console.log('✅ Images from dedicated endpoint:');
    console.log(JSON.stringify(imagesResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testProductAPI();
