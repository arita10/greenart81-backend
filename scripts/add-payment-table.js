// Add payment_transactions table for Shopier payment integration
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

async function addPaymentTable() {
  try {
    console.log('📝 Adding payment_transactions table...');

    const sqlFilePath = path.join(__dirname, '../config/add-payment-table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sql);

    console.log('✅ Payment table added successfully!');
    console.log('\nChanges made:');
    console.log('- Created payment_transactions table');
    console.log('- Added payment_status column to orders table');
    console.log('\nYour backend is now ready for Shopier payments! 🎉');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addPaymentTable();
