const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testCreateProduct() {
  try {
    console.log('1. Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@greenart81.com',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('✅ Login successful. Token obtained.');

    console.log('\n2. Creating test product...');
    const productData = {
      name: 'Debug Test Product',
      description: 'Created via debug script',
      price: 99.99,
      stock: 10,
      category: 'Debug Category', // This should trigger auto-creation
      image: 'https://via.placeholder.com/150', // Sending as 'image'
      is_featured: false
    };

    console.log('📤 Sending payload:', productData);

    const createRes = await axios.post(`${API_URL}/admin/products`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Response received:', createRes.status);
    console.log('🔍 Response Data:', JSON.stringify(createRes.data, null, 2));

    if (createRes.data.debug_info) {
        console.log('\n🐛 Debug Info from Server:');
        console.log(JSON.stringify(createRes.data.debug_info, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testCreateProduct();
