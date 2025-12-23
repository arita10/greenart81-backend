const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.name ILIKE $${paramCount}`;
      params.push(`%${category}%`);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    paginatedResponse(res, result.rows, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    console.error('Get all products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

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

    const reviewsResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = $1 AND status = $2',
      [id, 'approved']
    );

    const product = {
      ...result.rows[0],
      avg_rating: parseFloat(reviewsResult.rows[0].avg_rating) || 0,
      review_count: parseInt(reviewsResult.rows[0].review_count) || 0
    };

    successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    console.error('Get product by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name ILIKE $1 AND p.is_active = true',
      [`%${category}%`]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name ILIKE $1 AND p.is_active = true ORDER BY p.created_at DESC LIMIT $2 OFFSET $3',
      [`%${category}%`, limit, offset]
    );

    paginatedResponse(res, result.rows, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    console.error('Get products by category error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true AND p.is_active = true ORDER BY p.created_at DESC LIMIT $1',
      [limit]
    );

    successResponse(res, result.rows, 'Featured products retrieved successfully');
  } catch (error) {
    console.error('Get featured products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q, category, min_price, max_price, sort = 'newest', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true';
    const params = [];
    let paramCount = 1;

    if (q) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${q}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND c.name ILIKE $${paramCount}`;
      params.push(`%${category}%`);
      paramCount++;
    }

    if (min_price) {
      query += ` AND p.price >= $${paramCount}`;
      params.push(min_price);
      paramCount++;
    }

    if (max_price) {
      query += ` AND p.price <= $${paramCount}`;
      params.push(max_price);
      paramCount++;
    }

    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    if (sort === 'price_asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY p.price DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    paginatedResponse(res, result.rows, page, limit, total, 'Search results retrieved successfully');
  } catch (error) {
    console.error('Search products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts
};
