// Disable SSL certificate validation for Render.com database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function addQRPaymentTables() {
  try {
    console.log('🔄 Starting QR Payment tables migration...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../config/add-qr-payment.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Successfully created QR Payment tables:');
    console.log('   - payment_qr_codes');
    console.log('   - payment_slips');
    console.log('   - Updated orders table with payment_method column');
    console.log('   - Created performance indexes\n');

    // Verify tables were created
    const tablesCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('payment_qr_codes', 'payment_slips')
      ORDER BY table_name;
    `);

    console.log('📊 Verified tables in database:');
    tablesCheck.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Check if payment_method column was added to orders
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'payment_method';
    `);

    if (columnCheck.rows.length > 0) {
      console.log('   ✓ orders.payment_method column added');
    }

    console.log('\n🎉 QR Payment system is now ready!');
    console.log('\nNext steps:');
    console.log('1. Admin can create QR codes via: POST /api/qr-payment/qr-codes');
    console.log('2. Customers can upload payment slips via: POST /api/qr-payment/slips');
    console.log('3. Admin can verify slips via: GET /api/qr-payment/slips/all');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

addQRPaymentTables();
