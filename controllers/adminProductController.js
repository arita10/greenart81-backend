const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const fs = require('fs');
const path = require('path');

// Helper function to transform product data for frontend compatibility
const transformProduct = (product) => {
  return {
    ...product,
    _id: product.id, // Add MongoDB-style _id for frontend compatibility
    image: product.image_url || '', // Map image_url to image
    stock: product.stock_quantity !== undefined ? product.stock_quantity : product.stock, // Handle both field names
    category: product.category_name || product.category || '', // Ensure category is a string
    price: parseFloat(product.price) || 0, // Ensure price is a number
    stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : product.stock, // Keep original field
    useAsSlider: product.use_as_slider || false, // Map use_as_slider to useAsSlider for frontend
    use_as_slider: product.use_as_slider || false // Keep both naming conventions
  };
};

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM products');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Transform products for frontend compatibility
    const transformedProducts = result.rows.map(transformProduct);

    paginatedResponse(res, transformedProducts, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    console.error('Admin get all products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const logDebug = (message, data) => {
  try {
    const logPath = path.join(__dirname, '../debug_product_create.md');
    const timestamp = new Date().toISOString();
    const logEntry = `\n[${timestamp}] ${message}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
    fs.appendFileSync(logPath, logEntry);
  } catch (err) {
    console.error('Failed to write debug log:', err);
  }
};

const createProduct = async (req, res) => {
  const debugInfo = {
    step: 'start',
    received_keys: Object.keys(req.body),
    headers_content_type: req.headers['content-type']
  };

  try {
    // Normalize body keys to lower case for insensitive matching
    const body = {};
    for (const key in req.body) {
      body[key.toLowerCase().trim()] = req.body[key];
    }
    
    // Extract fields using normalized keys
    const name = body.name;
    const description = body.description;
    const price = body.price;
    const stock = body.stock || body.stock_quantity;
    const is_featured = body.is_featured || body.featured;
    const use_as_slider = body.use_as_slider || body.useasslider || body.slider || false;

    // Smart Category Extraction
    let categoryInput = body.category || body.category_id || body.categoryid || body.cat;
    
    // Smart Image Extraction
    // Look for any key that looks like an image
    let imageInput = body.image_url || body.image || body.imageurl || body.img || body.url;
    
    // If not found by direct key, search for ANY key containing "image" or "img"
    if (!imageInput) {
       const imageKey = Object.keys(body).find(k => k.includes('image') || k.includes('img'));
       if (imageKey) imageInput = body[imageKey];
    }

    const finalImageUrl = imageInput || '';
    
    debugInfo.extracted = {
      name,
      price,
      stock,
      categoryInput,
      finalImageUrl
    };

    if (!name || !price) {
      return errorResponse(res, 'Name and price are required', 'MISSING_FIELDS', 400);
    }

    // Resolve Category
    let finalCategoryId = null;

    if (categoryInput) {
      // Check if input is a numeric ID
      if (!isNaN(categoryInput) && parseInt(categoryInput) > 0) {
         finalCategoryId = parseInt(categoryInput);
         debugInfo.category_resolution = { type: 'id_provided', id: finalCategoryId };
      } 
      // Treat as name
      else {
        const categoryResult = await pool.query(
          'SELECT id, name FROM categories WHERE name ILIKE $1 LIMIT 1',
          [categoryInput]
        );

        if (categoryResult.rows.length > 0) {
          finalCategoryId = categoryResult.rows[0].id;
          debugInfo.category_resolution = { type: 'found_by_name', id: finalCategoryId, name: categoryResult.rows[0].name };
        } else {
          // Auto-create
          const newCatResult = await pool.query(
            'INSERT INTO categories (name, description, is_active) VALUES ($1, $2, true) RETURNING id',
            [categoryInput, 'Auto-created category']
          );
          finalCategoryId = newCatResult.rows[0].id;
          debugInfo.category_resolution = { type: 'created_new', id: finalCategoryId, name: categoryInput };
        }
      }
    } else {
       debugInfo.category_resolution = { type: 'none_provided' };
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url, is_featured, use_as_slider)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, parseFloat(price) || 0, stock || 0, finalCategoryId, finalImageUrl, is_featured || false, use_as_slider]
    );

    // Get category name for the response
    const productWithCategory = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    const transformed = transformProduct(productWithCategory.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: transformed,
      debug_info: debugInfo
    });
    
  } catch (error) {
    console.error('❌ Create product error:', error);
    errorResponse(res, 'Server error: ' + error.message, 'SERVER_ERROR', 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, category, image_url, image, imageUrl, img, is_featured, use_as_slider, useAsSlider } = req.body;

    // Robust image extraction
    const finalImageUrl = image_url || image || imageUrl || img;

    // Handle use_as_slider field
    const finalUseAsSlider = use_as_slider !== undefined ? use_as_slider : (useAsSlider !== undefined ? useAsSlider : undefined);

    // Map category string to category_id
    let finalCategoryId = category_id;

    if (!finalCategoryId && category) {
      // Look up category by name
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE name ILIKE $1 LIMIT 1',
        [category]
      );

      if (categoryResult.rows.length > 0) {
        finalCategoryId = categoryResult.rows[0].id;
      } else {
        // Auto-create category on update too if missing
        const newCatResult = await pool.query(
          'INSERT INTO categories (name, description, is_active) VALUES ($1, $2, true) RETURNING id',
          [category, 'Auto-created category']
        );
        finalCategoryId = newCatResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           category_id = COALESCE($5, category_id),
           image_url = COALESCE($6, image_url),
           is_featured = COALESCE($7, is_featured),
           use_as_slider = COALESCE($8, use_as_slider),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, description, price, stock, finalCategoryId, finalImageUrl, is_featured, finalUseAsSlider, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    // Get category name for the response
    const productWithCategory = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    successResponse(res, transformProduct(productWithCategory.rows[0]), 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return errorResponse(res, 'Valid stock quantity is required', 'INVALID_STOCK', 400);
    }

    const result = await pool.query(
      'UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [stock, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Stock updated successfully');
  } catch (error) {
    console.error('Update stock error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Product status toggled successfully');
  } catch (error) {
    console.error('Toggle active status error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const bulkUpload = async (req, res) => {
  const client = await pool.connect();

  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse(res, 'Products array is required', 'MISSING_FIELDS', 400);
    }

    await client.query('BEGIN');

    const uploadedProducts = [];

    for (const product of products) {
      if (!product.name || !product.price) {
        await client.query('ROLLBACK');
        return errorResponse(res, 'Each product must have name and price', 'INVALID_PRODUCT', 400);
      }

      const result = await client.query(
        `INSERT INTO products (name, description, price, stock, category_id, image_url, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          product.name,
          product.description,
          product.price,
          product.stock || 0,
          product.category_id,
          product.image_url,
          product.is_featured || false
        ]
      );

      uploadedProducts.push(result.rows[0]);
    }

    await client.query('COMMIT');

    successResponse(res, uploadedProducts, `${uploadedProducts.length} products uploaded successfully`, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk upload error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  } finally {
    client.release();
  }
};

const toggleSliderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET use_as_slider = NOT use_as_slider, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    // Get category name for the response
    const productWithCategory = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    successResponse(res, transformProduct(productWithCategory.rows[0]), 'Product slider status toggled successfully');
  } catch (error) {
    console.error('Toggle slider status error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  toggleActiveStatus,
  toggleSliderStatus,
  bulkUpload
};
