const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/check-images', async (req, res) => {
  try {
    // Count total images
    const countResult = await pool.query('SELECT COUNT(*) as count FROM product_images');
    
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
      LIMIT 100
    `);

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

    res.json({
        success: true,
        total_images: countResult.rows[0].count,
        sample_images: imagesResult.rows,
        products_with_images: perProductResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

router.get('/migrate-images', async (req, res) => {
    try {
        // Run the migration logic
        const result = await pool.query(`
            INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
            SELECT id, image_url, true, 0
            FROM products
            WHERE image_url IS NOT NULL
            AND image_url != ''
            AND NOT EXISTS (
                SELECT 1 FROM product_images WHERE product_id = products.id
            )
            RETURNING *
        `);
        res.json({
            success: true,
            migrated_count: result.rowCount,
            migrated_rows: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
