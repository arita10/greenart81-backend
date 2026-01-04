const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all images for a product
 */
exports.getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      `SELECT id, product_id, image_url, thumb_url, medium_url, alt_text, sort_order, is_primary, created_at
       FROM product_images
       WHERE product_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [productId]
    );

    successResponse(res, result.rows, 'Product images retrieved successfully');
  } catch (error) {
    console.error('Get product images error:', error);
    errorResponse(res, 'Failed to retrieve product images', 'SERVER_ERROR', 500);
  }
};

/**
 * Add images to a product
 */
exports.addProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { images } = req.body; // Array of { url, thumbUrl, mediumUrl, altText, isPrimary }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return errorResponse(res, 'Images array is required', 'MISSING_FIELDS', 400);
    }

    // Verify product exists
    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'NOT_FOUND', 404);
    }

    // Get current max sort order
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM product_images WHERE product_id = $1',
      [productId]
    );
    let nextSortOrder = maxOrderResult.rows[0].max_order + 1;

    const insertedImages = [];

    for (const image of images) {
      const result = await pool.query(
        `INSERT INTO product_images (product_id, image_url, thumb_url, medium_url, alt_text, is_primary, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          productId,
          image.url,
          image.thumbUrl || null,
          image.mediumUrl || null,
          image.altText || null,
          image.isPrimary || false,
          image.sortOrder !== undefined ? image.sortOrder : nextSortOrder++
        ]
      );
      insertedImages.push(result.rows[0]);
    }

    // If any image is set as primary, update others to not be primary
    const hasPrimary = images.some(img => img.isPrimary);
    if (hasPrimary) {
      const primaryImage = insertedImages.find(img => img.is_primary);
      await pool.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1 AND id != $2',
        [productId, primaryImage.id]
      );

      // Update products.image_url to match primary image for backward compatibility
      await pool.query(
        'UPDATE products SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [primaryImage.image_url, productId]
      );
    }

    successResponse(res, insertedImages, 'Product images added successfully', 201);
  } catch (error) {
    console.error('Add product images error:', error);
    errorResponse(res, 'Failed to add product images', 'SERVER_ERROR', 500);
  }
};

/**
 * Update image (e.g., change sort order, set as primary)
 */
exports.updateProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { sortOrder, isPrimary, altText } = req.body;

    const result = await pool.query(
      `UPDATE product_images
       SET sort_order = COALESCE($1, sort_order),
           is_primary = COALESCE($2, is_primary),
           alt_text = COALESCE($3, alt_text),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [sortOrder, isPrimary, altText, imageId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Image not found', 'NOT_FOUND', 404);
    }

    const image = result.rows[0];

    // If set as primary, update others and sync with products table
    if (isPrimary === true) {
      await pool.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1 AND id != $2',
        [image.product_id, imageId]
      );

      // Update products.image_url for backward compatibility
      await pool.query(
        'UPDATE products SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [image.image_url, image.product_id]
      );
    }

    successResponse(res, image, 'Product image updated successfully');
  } catch (error) {
    console.error('Update product image error:', error);
    errorResponse(res, 'Failed to update product image', 'SERVER_ERROR', 500);
  }
};

/**
 * Delete a product image
 */
exports.deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await pool.query(
      'DELETE FROM product_images WHERE id = $1 RETURNING *',
      [imageId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Image not found', 'NOT_FOUND', 404);
    }

    const deletedImage = result.rows[0];

    // If deleted image was primary, set first remaining image as primary
    if (deletedImage.is_primary) {
      const newPrimary = await pool.query(
        `UPDATE product_images
         SET is_primary = true
         WHERE product_id = $1
         AND id = (SELECT id FROM product_images WHERE product_id = $1 ORDER BY sort_order LIMIT 1)
         RETURNING *`,
        [deletedImage.product_id]
      );

      if (newPrimary.rows.length > 0) {
        // Update products.image_url to new primary
        await pool.query(
          'UPDATE products SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newPrimary.rows[0].image_url, deletedImage.product_id]
        );
      } else {
        // No images left, clear product image_url
        await pool.query(
          'UPDATE products SET image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [deletedImage.product_id]
        );
      }
    }

    successResponse(res, null, 'Product image deleted successfully');
  } catch (error) {
    console.error('Delete product image error:', error);
    errorResponse(res, 'Failed to delete product image', 'SERVER_ERROR', 500);
  }
};

/**
 * Reorder product images
 */
exports.reorderProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageIds } = req.body; // Array of image IDs in desired order

    if (!imageIds || !Array.isArray(imageIds)) {
      return errorResponse(res, 'Image IDs array is required', 'MISSING_FIELDS', 400);
    }

    // Update sort_order for each image
    for (let i = 0; i < imageIds.length; i++) {
      await pool.query(
        'UPDATE product_images SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND product_id = $3',
        [i, imageIds[i], productId]
      );
    }

    // Get updated images
    const result = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order',
      [productId]
    );

    successResponse(res, result.rows, 'Product images reordered successfully');
  } catch (error) {
    console.error('Reorder product images error:', error);
    errorResponse(res, 'Failed to reorder product images', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getProductImages,
  addProductImages,
  updateProductImage,
  deleteProductImage,
  reorderProductImages
};
