const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

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

    paginatedResponse(res, result.rows, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    console.error('Admin get all products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url, is_featured } = req.body;

    if (!name || !price) {
      return errorResponse(res, 'Name and price are required', 'MISSING_FIELDS', 400);
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, price, stock || 0, category_id, image_url, is_featured || false]
    );

    successResponse(res, result.rows[0], 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image_url, is_featured } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           category_id = COALESCE($5, category_id),
           image_url = COALESCE($6, image_url),
           is_featured = COALESCE($7, is_featured),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, price, stock, category_id, image_url, is_featured, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Product updated successfully');
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

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  toggleActiveStatus,
  bulkUpload
};
