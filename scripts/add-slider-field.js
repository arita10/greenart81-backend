const pool = require('../config/database');

async function addSliderField() {
  try {
    console.log('🔧 Adding use_as_slider field to products table...');

    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products'
      AND column_name = 'use_as_slider'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Column use_as_slider already exists');
    } else {
      // Add the column
      await pool.query(`
        ALTER TABLE products
        ADD COLUMN use_as_slider BOOLEAN DEFAULT false
      `);
      console.log('✅ Column use_as_slider added successfully');
    }

    // Show current products that could be sliders
    const products = await pool.query(`
      SELECT id, name, is_featured, use_as_slider
      FROM products
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n📊 Current products:');
    console.table(products.rows);

    console.log('\n💡 To set products as sliders, run:');
    console.log('   UPDATE products SET use_as_slider = true WHERE id IN (1, 2, 3);');
    console.log('\nOr use the admin panel to toggle the slider status.');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addSliderField();
