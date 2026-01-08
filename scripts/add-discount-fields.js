// Disable SSL certificate validation for Render.com database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function addDiscountFields() {
  try {
    console.log('🔄 Starting discount fields migration...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../config/add-discount-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Successfully added discount fields to products table:');
    console.log('   - discount_percentage (0-100)');
    console.log('   - discount_price (optional pre-calculated)');
    console.log('   - sale_start_date (optional)');
    console.log('   - sale_end_date (optional)');
    console.log('   - is_on_sale (boolean flag)');
    console.log('   - Performance indexes created\n');

    // Verify columns were added
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'products'
        AND column_name IN ('discount_percentage', 'discount_price', 'is_on_sale', 'sale_start_date', 'sale_end_date')
      ORDER BY column_name;
    `);

    if (columnsCheck.rows.length > 0) {
      console.log('📊 Verified columns in products table:');
      console.table(columnsCheck.rows);
    }

    // Show example usage
    console.log('\n💡 Example Usage:');
    console.log('   Set 20% discount: UPDATE products SET discount_percentage = 20, is_on_sale = true WHERE id = 1');
    console.log('   Sale price auto-calculated: price * (1 - discount_percentage/100)');
    console.log('   API will return both original_price and sale_price\n');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

addDiscountFields();
