# Multiple Product Images Implementation Guide

## Overview
This guide explains how to add support for multiple images per product while maintaining backward compatibility with the existing single `image_url` field.

## Approach Options

### Option 1: Separate Table (Recommended)
Create a new `product_images` table to store multiple images per product. This is the most flexible and scalable approach.

### Option 2: JSON Array Field
Store multiple image URLs in a JSON/JSONB array field in the products table. Simpler but less flexible.

---

## Option 1: Separate Table (RECOMMENDED)

### Benefits
- ✅ Better database normalization
- ✅ Easy to add image metadata (alt text, sort order, etc.)
- ✅ Efficient querying and indexing
- ✅ Full backward compatibility
- ✅ Easy to manage individual images

### 1. Database Migration

Create file: `config/add-product-images-table.sql`

```sql
-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumb_url TEXT,
  medium_url TEXT,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- Migrate existing image_url data to product_images table
-- This makes existing single images the primary image
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
SELECT id, image_url, true, 0
FROM products
WHERE image_url IS NOT NULL AND image_url != '';

-- Add comment to products.image_url for documentation
COMMENT ON COLUMN products.image_url IS 'Legacy field - kept for backward compatibility. Use product_images table for new implementations.';
```

### 2. Database Migration Script

Create file: `scripts/add-product-images-table.js`

```javascript
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
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.image_url as legacy_image,
        (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true) as primary_image
      FROM products p
      LIMIT 5
    `);

    console.log('📊 Sample products with images:');
    console.table(result.rows);

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

addProductImagesTable();
```

### 3. Update Upload Controller

Add to `controllers/uploadController.js`:

```javascript
/**
 * Upload multiple product images
 */
exports.uploadMultipleProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No product images provided',
        code: 'NO_FILES'
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 images allowed per product',
        code: 'TOO_MANY_FILES'
      });
    }

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map((file, index) =>
      imageUploadService.uploadToCloudinary(
        file.buffer,
        `product_${Date.now()}_${index}_${file.originalname}`
      )
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        images: results.map((r, index) => ({
          url: r.url,
          thumbUrl: r.thumbUrl,
          mediumUrl: r.mediumUrl,
          sortOrder: index
        })),
        count: results.length
      },
      message: `${results.length} product images uploaded successfully`
    });
  } catch (error) {
    console.error('Multiple product images upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Product images upload failed',
      code: 'UPLOAD_FAILED'
    });
  }
};
```

### 4. Update Upload Routes

Add to `routes/uploadRoutes.js`:

```javascript
// Upload multiple product images (admin only) - up to 10 images
router.post(
  '/product/multiple',
  authenticateToken,
  isAdmin,
  upload.array('images', 10),
  uploadController.uploadMultipleProductImages
);
```

### 5. Create Product Images Controller

Create file: `controllers/productImagesController.js`:

```javascript
const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all images for a product
 */
exports.getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      `SELECT * FROM product_images
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

      // Update products.image_url to match primary image
      await pool.query(
        'UPDATE products SET image_url = $1 WHERE id = $2',
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

    // If set as primary, update others
    if (isPrimary === true) {
      await pool.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1 AND id != $2',
        [image.product_id, imageId]
      );

      // Update products.image_url
      await pool.query(
        'UPDATE products SET image_url = $1 WHERE id = $2',
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
        await pool.query(
          'UPDATE products SET image_url = $1 WHERE id = $2',
          [newPrimary.rows[0].image_url, deletedImage.product_id]
        );
      } else {
        // No images left, clear product image_url
        await pool.query(
          'UPDATE products SET image_url = NULL WHERE id = $1',
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
        'UPDATE product_images SET sort_order = $1 WHERE id = $2 AND product_id = $3',
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
```

### 6. Update Product Controller

Modify `transformProduct` function in both `productController.js` and `adminProductController.js`:

```javascript
// Add this helper function at the top
const getProductWithImages = async (productId) => {
  const images = await pool.query(
    `SELECT id, image_url, thumb_url, medium_url, alt_text, is_primary, sort_order
     FROM product_images
     WHERE product_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [productId]
  );
  return images.rows;
};

// Update transformProduct function
const transformProduct = async (product) => {
  // Fetch all images for this product
  const images = await getProductWithImages(product.id);

  // Find primary image or use first one
  const primaryImage = images.find(img => img.is_primary) || images[0];

  return {
    ...product,
    _id: product.id,
    image: primaryImage?.image_url || product.image_url || '', // Primary image or legacy
    image_url: primaryImage?.image_url || product.image_url || '', // Keep both
    images: images.map(img => ({
      id: img.id,
      url: img.image_url,
      thumbUrl: img.thumb_url,
      mediumUrl: img.medium_url,
      altText: img.alt_text,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order
    })), // All images array
    stock: product.stock || 0,
    category: product.category_name || product.category || '',
    price: parseFloat(product.price) || 0,
    useAsSlider: product.use_as_slider || false,
    use_as_slider: product.use_as_slider || false
  };
};

// IMPORTANT: Update all controller functions to await transformProduct
// Example:
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    const product = await transformProduct(result.rows[0]); // Add await
    successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    console.error('Get product by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};
```

### 7. Create Routes

Create file: `routes/productImagesRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const productImagesController = require('../controllers/productImagesController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public route - get product images
router.get('/:productId/images', productImagesController.getProductImages);

// Admin routes
router.post('/:productId/images', authenticateToken, isAdmin, productImagesController.addProductImages);
router.put('/images/:imageId', authenticateToken, isAdmin, productImagesController.updateProductImage);
router.delete('/images/:imageId', authenticateToken, isAdmin, productImagesController.deleteProductImage);
router.put('/:productId/images/reorder', authenticateToken, isAdmin, productImagesController.reorderProductImages);

module.exports = router;
```

Add to `app.js`:

```javascript
const productImagesRoutes = require('./routes/productImagesRoutes');
app.use('/api/products', productImagesRoutes);
```

### 8. API Endpoints

After implementation, you'll have these endpoints:

**Public:**
- `GET /api/products/:productId/images` - Get all images for a product

**Admin:**
- `POST /api/upload/product/multiple` - Upload multiple images (returns URLs)
- `POST /api/products/:productId/images` - Add uploaded images to product
- `PUT /api/products/images/:imageId` - Update image metadata
- `DELETE /api/products/images/:imageId` - Delete an image
- `PUT /api/products/:productId/images/reorder` - Reorder images

### 9. Frontend Usage Example

```javascript
// 1. Upload multiple images
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const uploadRes = await axios.post('/api/upload/product/multiple', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

const imageUrls = uploadRes.data.data.images;

// 2. Add images to product
await axios.post(`/api/products/${productId}/images`, {
  images: imageUrls.map((img, index) => ({
    url: img.url,
    thumbUrl: img.thumbUrl,
    mediumUrl: img.mediumUrl,
    isPrimary: index === 0, // First image is primary
    sortOrder: index
  }))
});

// 3. Get product with all images
const product = await axios.get(`/api/products/${productId}`);
console.log(product.data.data.images); // Array of all images

// 4. Display in gallery
product.data.data.images.forEach(img => {
  // img.url - full size
  // img.thumbUrl - thumbnail
  // img.mediumUrl - medium size
  // img.isPrimary - is this the main image?
});
```

---

## Option 2: JSON Array Field (Simpler Alternative)

### 1. Database Migration

```sql
-- Add images array field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- Migrate existing image_url to images array
UPDATE products
SET images = jsonb_build_array(
  jsonb_build_object(
    'url', image_url,
    'isPrimary', true,
    'sortOrder', 0
  )
)
WHERE image_url IS NOT NULL AND image_url != '' AND images = '[]';

-- Create index for JSON queries
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);
```

### 2. Update Product Controller

```javascript
const transformProduct = (product) => {
  const imagesArray = product.images || [];
  const primaryImage = imagesArray.find(img => img.isPrimary) || imagesArray[0];

  return {
    ...product,
    _id: product.id,
    image: primaryImage?.url || product.image_url || '',
    images: imagesArray,
    // ... rest of fields
  };
};
```

### 3. Update Create/Update Product

```javascript
const createProduct = async (req, res) => {
  const { name, price, images } = req.body; // images is array

  const result = await pool.query(
    `INSERT INTO products (name, price, images, image_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [
      name,
      price,
      JSON.stringify(images || []),
      images?.[0]?.url || '' // Set first image as legacy image_url
    ]
  );
  // ...
};
```

---

## Recommendation

**Use Option 1 (Separate Table)** because:
1. Better for future scaling (100s of images per product)
2. Easier to add metadata (alt text, captions, etc.)
3. Better performance for image-specific queries
4. Cleaner separation of concerns
5. Easier to implement image CDN optimization later

**Use Option 2 (JSON Array)** only if:
- You need quick implementation
- Products will have max 3-5 images
- You don't need complex image metadata

---

## Migration Steps

1. Run database migration: `node scripts/add-product-images-table.js`
2. Update controllers and routes
3. Test with existing products (should still work)
4. Update frontend to use new image upload endpoints
5. Gradually migrate frontend to use `images` array instead of single `image`

## Backward Compatibility

- ✅ `products.image_url` is kept and synced with primary image
- ✅ Existing API responses include both `image` (single) and `images` (array)
- ✅ Frontend can transition gradually
- ✅ Old products automatically migrated to new system
