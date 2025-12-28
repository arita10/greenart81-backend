// Automated QR Payment Full Loop Test
// Tests the complete payment workflow from QR creation to verification

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test data storage
let adminToken = '';
let customerToken = '';
let qrCodeId = null;
let orderId = null;
let slipId = null;
let qrImageUrl = '';
let slipImageUrl = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(60));
  log(`TEST: ${testName}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ PASS: ${message}`, 'green');
}

function logError(message) {
  log(`❌ FAIL: ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test functions
async function test1_AdminLogin() {
  logTest('1. Admin Login');

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@greenart81.com',
      password: 'admin123'
    });

    if (response.data.success && response.data.data.token) {
      adminToken = response.data.data.token;
      logSuccess('Admin logged in successfully');
      logInfo(`Admin ID: ${response.data.data.user.id}`);
      logInfo(`Role: ${response.data.data.user.role}`);
      return true;
    }

    logError('Login succeeded but no token received');
    return false;
  } catch (error) {
    logError(`Admin login failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test2_CustomerRegister() {
  logTest('2. Customer Registration');

  const customerEmail = `testcustomer${Date.now()}@test.com`;

  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: customerEmail,
      password: 'test123',
      name: 'Test Customer',
      phone: '1234567890'
    });

    if (response.data.success && response.data.data.token) {
      customerToken = response.data.data.token;
      logSuccess('Customer registered successfully');
      logInfo(`Customer Email: ${customerEmail}`);
      logInfo(`Customer ID: ${response.data.data.user.id}`);
      return true;
    }

    logError('Registration succeeded but no token received');
    return false;
  } catch (error) {
    logError(`Customer registration failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test3_CreateQRCode() {
  logTest('3. Admin Creates QR Code');

  // Using a placeholder image URL (in real test, upload actual image first)
  qrImageUrl = 'https://via.placeholder.com/300x300.png?text=QR+Code';

  try {
    const response = await axios.post(
      `${API_URL}/qr-payment/qr-codes`,
      {
        bank_name: 'Test Bank',
        account_name: 'GreenArt81 Test Account',
        account_number: '123-456-7890',
        qr_code_image_url: qrImageUrl,
        payment_type: 'bank_transfer'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success && response.data.data.id) {
      qrCodeId = response.data.data.id;
      logSuccess('QR Code created successfully');
      logInfo(`QR Code ID: ${qrCodeId}`);
      logInfo(`Bank: ${response.data.data.bank_name}`);
      logInfo(`Account: ${response.data.data.account_name}`);
      return true;
    }

    logError('QR code creation succeeded but no ID received');
    return false;
  } catch (error) {
    logError(`QR code creation failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test4_GetActiveQRCodes() {
  logTest('4. Get Active QR Codes (Public)');

  try {
    const response = await axios.get(`${API_URL}/qr-payment/qr-codes/active`);

    if (response.data.success && Array.isArray(response.data.data)) {
      const qrCodes = response.data.data;
      logSuccess(`Retrieved ${qrCodes.length} active QR code(s)`);

      if (qrCodes.length > 0) {
        logInfo(`First QR Code: ${qrCodes[0].bank_name}`);
      }

      // Verify our created QR code is in the list
      const ourQR = qrCodes.find(qr => qr.id === qrCodeId);
      if (ourQR) {
        logSuccess('Our QR code is visible in active list');
      } else {
        logError('Our QR code not found in active list');
        return false;
      }

      return true;
    }

    logError('Invalid response format');
    return false;
  } catch (error) {
    logError(`Get active QR codes failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test5_CreateOrder() {
  logTest('5. Customer Creates Order');

  try {
    // First, add item to cart (assuming product ID 1 exists)
    try {
      await axios.post(
        `${API_URL}/cart`,
        {
          product_id: 1,
          quantity: 2
        },
        {
          headers: { Authorization: `Bearer ${customerToken}` }
        }
      );
      logInfo('Added items to cart');
    } catch (cartError) {
      logInfo('Cart add skipped (might not have products yet)');
    }

    // Create order
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        shipping_address: '123 Test Street, Bangkok, Thailand 10100',
        phone: '0812345678'
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    if (response.data.success && response.data.data.order.id) {
      orderId = response.data.data.order.id;
      logSuccess('Order created successfully');
      logInfo(`Order ID: ${orderId}`);
      logInfo(`Order Number: ${response.data.data.order.order_number}`);
      logInfo(`Total Amount: ${response.data.data.order.total_amount}`);
      logInfo(`Payment Status: ${response.data.data.order.payment_status}`);
      return true;
    }

    logError('Order creation succeeded but no ID received');
    return false;
  } catch (error) {
    logError(`Order creation failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test6_UploadPaymentSlip() {
  logTest('6. Customer Uploads Payment Slip');

  // Using placeholder image (in real test, upload actual image first)
  slipImageUrl = 'https://via.placeholder.com/400x600.png?text=Payment+Slip';

  try {
    const response = await axios.post(
      `${API_URL}/qr-payment/slips`,
      {
        order_id: orderId,
        qr_code_id: qrCodeId,
        slip_image_url: slipImageUrl,
        amount: 100.00,
        payment_date: new Date().toISOString(),
        transaction_reference: `TXN${Date.now()}`,
        notes: 'Test payment via automated script'
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    if (response.data.success && response.data.data.id) {
      slipId = response.data.data.id;
      logSuccess('Payment slip uploaded successfully');
      logInfo(`Slip ID: ${slipId}`);
      logInfo(`Amount: ${response.data.data.amount}`);
      logInfo(`Status: ${response.data.data.status}`);
      return true;
    }

    logError('Slip upload succeeded but no ID received');
    return false;
  } catch (error) {
    logError(`Payment slip upload failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test7_VerifyOrderStatusPending() {
  logTest('7. Verify Order Status Changed to Pending Verification');

  try {
    const response = await axios.get(
      `${API_URL}/orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    if (response.data.success) {
      const order = response.data.data;
      logInfo(`Payment Status: ${order.payment_status}`);
      logInfo(`Payment Method: ${order.payment_method}`);

      if (order.payment_status === 'pending_verification' && order.payment_method === 'qr_code') {
        logSuccess('Order status correctly updated to pending_verification');
        return true;
      } else {
        logError(`Expected payment_status='pending_verification', got '${order.payment_status}'`);
        return false;
      }
    }

    logError('Invalid response format');
    return false;
  } catch (error) {
    logError(`Get order failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test8_GetPendingSlips() {
  logTest('8. Admin Views Pending Payment Slips');

  try {
    const response = await axios.get(
      `${API_URL}/qr-payment/slips/all?status=pending`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      const pendingSlips = response.data.data;
      logSuccess(`Retrieved ${pendingSlips.length} pending slip(s)`);

      // Find our slip
      const ourSlip = pendingSlips.find(slip => slip.id === slipId);
      if (ourSlip) {
        logSuccess('Our payment slip found in pending list');
        logInfo(`Customer: ${ourSlip.customer_name}`);
        logInfo(`Order: ${ourSlip.order_number}`);
        logInfo(`Amount: ${ourSlip.amount}`);
      } else {
        logError('Our payment slip not found in pending list');
        return false;
      }

      return true;
    }

    logError('Invalid response format');
    return false;
  } catch (error) {
    logError(`Get pending slips failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test9_ApprovePayment() {
  logTest('9. Admin Approves Payment Slip');

  try {
    const response = await axios.put(
      `${API_URL}/qr-payment/slips/${slipId}/verify`,
      {
        status: 'approved',
        verification_notes: 'Automated test - payment verified and approved'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      logSuccess('Payment slip approved successfully');
      logInfo(`Status: ${response.data.data.status}`);
      logInfo(`Verified At: ${response.data.data.verified_at}`);
      logInfo(`Notes: ${response.data.data.verification_notes}`);
      return true;
    }

    logError('Approval succeeded but invalid response');
    return false;
  } catch (error) {
    logError(`Payment approval failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test10_VerifyOrderCompleted() {
  logTest('10. Verify Order Status Changed to Completed');

  try {
    const response = await axios.get(
      `${API_URL}/orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    if (response.data.success) {
      const order = response.data.data;
      logInfo(`Payment Status: ${order.payment_status}`);
      logInfo(`Order Status: ${order.order_status}`);

      if (order.payment_status === 'completed' && order.order_status === 'processing') {
        logSuccess('Order status correctly updated after approval');
        logSuccess('Payment status: completed ✅');
        logSuccess('Order status: processing ✅');
        return true;
      } else {
        logError(`Expected payment_status='completed' and order_status='processing'`);
        logError(`Got payment_status='${order.payment_status}' and order_status='${order.order_status}'`);
        return false;
      }
    }

    logError('Invalid response format');
    return false;
  } catch (error) {
    logError(`Get order failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test11_CustomerViewsSlip() {
  logTest('11. Customer Views Their Payment Slip');

  try {
    const response = await axios.get(
      `${API_URL}/qr-payment/slips/order/${orderId}`,
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    if (response.data.success) {
      const slip = response.data.data;
      logSuccess('Payment slip retrieved successfully');
      logInfo(`Status: ${slip.status}`);
      logInfo(`Verified By: ${slip.verified_by_name || 'N/A'}`);
      logInfo(`Verification Notes: ${slip.verification_notes || 'N/A'}`);

      if (slip.status === 'approved') {
        logSuccess('Customer can see approval status');
        return true;
      } else {
        logError(`Expected status='approved', got '${slip.status}'`);
        return false;
      }
    }

    logError('Invalid response format');
    return false;
  } catch (error) {
    logError(`Get slip failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function test12_ErrorHandling() {
  logTest('12. Error Handling - Duplicate Slip Upload');

  try {
    await axios.post(
      `${API_URL}/qr-payment/slips`,
      {
        order_id: orderId,
        qr_code_id: qrCodeId,
        slip_image_url: slipImageUrl,
        amount: 100.00
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    logError('Duplicate upload should have been rejected but succeeded');
    return false;
  } catch (error) {
    if (error.response?.data?.code === 'ALREADY_EXISTS') {
      logSuccess('Duplicate upload correctly rejected');
      logInfo(`Error: ${error.response.data.error}`);
      return true;
    } else {
      logError(`Unexpected error: ${error.response?.data?.error || error.message}`);
      return false;
    }
  }
}

async function test13_CleanupQRCode() {
  logTest('13. Cleanup - Delete Test QR Code');

  try {
    const response = await axios.delete(
      `${API_URL}/qr-payment/qr-codes/${qrCodeId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      logSuccess('Test QR code deleted successfully');
      return true;
    }

    logError('Deletion succeeded but invalid response');
    return false;
  } catch (error) {
    logError(`QR code deletion failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║      QR PAYMENT SYSTEM - FULL LOOP AUTOMATED TEST         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTesting against: ${BASE_URL}\n`, 'yellow');

  const tests = [
    test1_AdminLogin,
    test2_CustomerRegister,
    test3_CreateQRCode,
    test4_GetActiveQRCodes,
    test5_CreateOrder,
    test6_UploadPaymentSlip,
    test7_VerifyOrderStatusPending,
    test8_GetPendingSlips,
    test9_ApprovePayment,
    test10_VerifyOrderCompleted,
    test11_CustomerViewsSlip,
    test12_ErrorHandling,
    test13_CleanupQRCode
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      results.push({ name: test.name, passed: result });
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test ${test.name} crashed: ${error.message}`);
      results.push({ name: test.name, passed: false });
      failed++;
    }
  }

  // Summary
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      TEST SUMMARY                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';
    log(`${index + 1}. ${result.name}: ${status}`, color);
  });

  console.log('\n');
  log(`Total Tests: ${tests.length}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');
  log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`, 'yellow');

  console.log('\n');

  if (failed === 0) {
    log('╔════════════════════════════════════════════════════════════╗', 'green');
    log('║          ALL TESTS PASSED! SYSTEM IS WORKING! ✅          ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝', 'green');
    process.exit(0);
  } else {
    log('╔════════════════════════════════════════════════════════════╗', 'red');
    log('║           SOME TESTS FAILED - CHECK LOGS ABOVE            ║', 'red');
    log('╚════════════════════════════════════════════════════════════╝', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
