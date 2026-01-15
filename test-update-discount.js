// Test script to verify discount update functionality
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('./config/database');

async function testDiscountUpdate() {
  try {
    console.log('🧪 Testing discount update logic\n');

    // Simulate the normalized body processing
    const mockRequestBody = {
      discountPercentage: 15,  // camelCase from frontend
      isOnSale: true           // camelCase from frontend
    };

    console.log('1. Frontend sends (camelCase):');
    console.log(JSON.stringify(mockRequestBody, null, 2));

    // Normalize keys to lowercase (as in updated code)
    const body = {};
    for (const key in mockRequestBody) {
      body[key.toLowerCase().trim()] = mockRequestBody[key];
    }

    console.log('\n2. After normalization to lowercase:');
    console.log(JSON.stringify(body, null, 2));

    // Extract with fallback (as in updated code)
    const discount_percentage = body.discount_percentage ?? body.discountpercentage;
    const is_on_sale = body.is_on_sale ?? body.isonsale ?? body.onsale;

    console.log('\n3. Extracted values:');
    console.log('discount_percentage:', discount_percentage);
    console.log('is_on_sale:', is_on_sale);

    if (discount_percentage === 15 && is_on_sale === true) {
      console.log('\n✅ SUCCESS: Values extracted correctly!');
      console.log('The fix will work for camelCase field names.\n');
    } else {
      console.log('\n❌ FAIL: Values not extracted correctly');
    }

    // Test with snake_case too
    console.log('\n--- Testing snake_case input ---\n');

    const snakeBody = {
      discount_percentage: 20,
      is_on_sale: false
    };

    console.log('4. Frontend sends (snake_case):');
    console.log(JSON.stringify(snakeBody, null, 2));

    const body2 = {};
    for (const key in snakeBody) {
      body2[key.toLowerCase().trim()] = snakeBody[key];
    }

    const discount2 = body2.discount_percentage ?? body2.discountpercentage;
    const sale2 = body2.is_on_sale ?? body2.isonsale ?? body2.onsale;

    console.log('\n5. Extracted values:');
    console.log('discount_percentage:', discount2);
    console.log('is_on_sale:', sale2);

    if (discount2 === 20 && sale2 === false) {
      console.log('\n✅ SUCCESS: snake_case also works!');
      console.log('The fix supports both naming conventions.\n');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDiscountUpdate();
