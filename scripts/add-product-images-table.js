// Disable SSL certificate validation for Render.com database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function addProductImagesTable() {
  try {
    console.log('🔄 Starting product images table migration...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../config/add-product-images-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Successfully created product_images table');
    console.log('✅ Migrated existing product images to new table');
    console.log('✅ Created performance indexes\n');

    // Verify migration
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'product_images';
    `);

    if (tableCheck.rows.length > 0) {
      console.log('📊 Table verification: product_images table exists ✓\n');
    }

    // Check migrated data
    const migratedCount = await pool.query(`
      SELECT COUNT(*) as count FROM product_images;
    `);
    console.log(`📸 Migrated ${migratedCount.rows[0].count} existing product images\n`);

    // Sample products with images
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.image_url as legacy_image,
        (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      WHERE p.image_url IS NOT NULL AND p.image_url != ''
      LIMIT 5
    `);

    if (result.rows.length > 0) {
      console.log('📦 Sample products with images:');
      console.table(result.rows);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Upload endpoint: POST /api/upload/product/multiple (upload up to 10 images)');
    console.log('2. Add to product: POST /api/products/:productId/images');
    console.log('3. Get images: GET /api/products/:productId/images');
    console.log('4. Update image: PUT /api/products/images/:imageId');
    console.log('5. Delete image: DELETE /api/products/images/:imageId');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

addProductImagesTable();
