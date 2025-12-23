const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id, w.created_at,
              p.id as product_id, p.name, p.price, p.image_url, p.stock, p.is_active
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    const wishlistItems = result.rows.map(item => ({
      id: item.id,
      created_at: item.created_at,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        stock: item.stock,
        is_active: item.is_active
      }
    }));

    successResponse(res, wishlistItems, 'Wishlist retrieved successfully');
  } catch (error) {
    console.error('Get wishlist error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return errorResponse(res, 'Product ID is required', 'MISSING_FIELDS', 400);
    }

    const productResult = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    const existingWishlist = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingWishlist.rows.length > 0) {
      return errorResponse(res, 'Product already in wishlist', 'ALREADY_IN_WISHLIST', 400);
    }

    const result = await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, product_id]
    );

    successResponse(res, result.rows[0], 'Product added to wishlist successfully', 201);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [req.user.id, productId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not in wishlist', 'NOT_IN_WISHLIST', 404);
    }

    successResponse(res, null, 'Product removed from wishlist successfully');
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
