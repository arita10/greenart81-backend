// Add QR Code Payment System
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: process.env.DB_CONNECTION_STRING.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function addQRPaymentSystem() {
  try {
    console.log('📝 Adding QR Code Payment System...');

    const sqlFilePath = path.join(__dirname, '../config/add-qr-payment.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sql);

    console.log('✅ QR Payment System added successfully!');
    console.log('\nChanges made:');
    console.log('- Created payment_qr_codes table (for admin to manage QR codes)');
    console.log('- Created payment_slips table (for user payment slip uploads)');
    console.log('- Added payment_method column to orders table');
    console.log('- Created indexes for performance');
    console.log('- Inserted sample QR code');
    console.log('\nYour backend is now ready for QR Code payments! 🎉');
    console.log('\nPayment Flow:');
    console.log('1. Admin uploads QR code images');
    console.log('2. Customer sees QR code during checkout');
    console.log('3. Customer pays via bank transfer/mobile banking');
    console.log('4. Customer uploads payment slip proof');
    console.log('5. Admin verifies payment slip');
    console.log('6. Order status updated automatically ✅');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addQRPaymentSystem();
