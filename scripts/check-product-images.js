// Disable SSL certificate validation for Render.com database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('../config/database');

async function checkProductImages() {
  try {
    console.log('🖼️  Checking Product Images...\n');

    // Count total images
    const countResult = await pool.query('SELECT COUNT(*) as count FROM product_images');
    console.log(`📊 Total images in product_images table: ${countResult.rows[0].count}\n`);

    // Get all images with product details
    const imagesResult = await pool.query(`
      SELECT
        pi.id,
        pi.product_id,
        p.name as product_name,
        pi.image_url,
        pi.thumb_url,
        pi.medium_url,
        pi.is_primary,
        pi.sort_order,
        pi.created_at
      FROM product_images pi
      JOIN products p ON pi.product_id = p.id
      ORDER BY pi.product_id, pi.sort_order
    `);

    if (imagesResult.rows.length > 0) {
      console.log('🖼️  Product Images:');
      console.table(imagesResult.rows.map(img => ({
        id: img.id,
        product_id: img.product_id,
        product_name: img.product_name,
        is_primary: img.is_primary,
        sort_order: img.sort_order,
        has_thumb: !!img.thumb_url,
        has_medium: !!img.medium_url
      })));
    } else {
      console.log('⚠️  No images found in product_images table');
    }

    // Count images per product
    const perProductResult = await pool.query(`
      SELECT
        p.id,
        p.name,
        COUNT(pi.id) as image_count,
        MAX(CASE WHEN pi.is_primary THEN 'Yes' ELSE 'No' END) as has_primary
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id, p.name
      HAVING COUNT(pi.id) > 0
      ORDER BY image_count DESC, p.id
    `);

    if (perProductResult.rows.length > 0) {
      console.log('\n📦 Products with Images:');
      console.table(perProductResult.rows);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProductImages();
