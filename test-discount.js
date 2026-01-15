const axios = require('axios');

async function testDiscountSystem() {
  try {
    const BASE_URL = 'https://greenart81-backend.onrender.com/api';

    // You need to replace this with your actual admin token
    const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

    console.log('🧪 Testing Discount System\n');

    // Test 1: Get current product state
    console.log('Test 1: Get product 14 current state');
    const getResponse = await axios.get(`${BASE_URL}/products/14`);
    console.log('Current discount_percentage:', getResponse.data.data.discount_percentage);
    console.log('Current is_on_sale:', getResponse.data.data.is_on_sale);
    console.log('Current salePrice:', getResponse.data.data.salePrice);
    console.log('Current isOnSale:', getResponse.data.data.isOnSale);

    // Test 2: Update product with discount (requires admin token)
    console.log('\n\nTest 2: Setting 20% discount on product 14');
    console.log('⚠️  NOTE: This requires a valid admin token!\n');

    if (ADMIN_TOKEN !== 'YOUR_ADMIN_TOKEN_HERE') {
      const updateResponse = await axios.put(
        `${BASE_URL}/admin/products/14`,
        {
          discount_percentage: 20,
          is_on_sale: true
        },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Update successful!');
      console.log('New discount_percentage:', updateResponse.data.data.discount_percentage);
      console.log('New is_on_sale:', updateResponse.data.data.is_on_sale);
      console.log('New salePrice:', updateResponse.data.data.salePrice);
      console.log('New originalPrice:', updateResponse.data.data.originalPrice);
      console.log('New discountAmount:', updateResponse.data.data.discountAmount);

      // Test 3: Verify the update
      console.log('\n\nTest 3: Verify discount was saved');
      const verifyResponse = await axios.get(`${BASE_URL}/products/14`);
      console.log('Verified discount_percentage:', verifyResponse.data.data.discount_percentage);
      console.log('Verified is_on_sale:', verifyResponse.data.data.is_on_sale);
      console.log('Verified salePrice:', verifyResponse.data.data.salePrice);
      console.log('Verified isOnSale:', verifyResponse.data.data.isOnSale);

      if (verifyResponse.data.data.discountPercentage === 20 && verifyResponse.data.data.isOnSale === true) {
        console.log('\n✅ SUCCESS: Discount was saved correctly!');
      } else {
        console.log('\n❌ ERROR: Discount was NOT saved correctly!');
      }
    } else {
      console.log('❌ Skipping update test - no admin token provided');
      console.log('To test updates, replace ADMIN_TOKEN in this file with your actual admin token');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDiscountSystem();
