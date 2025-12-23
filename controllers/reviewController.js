const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE product_id = $1 AND status = $2',
      [id, 'approved']
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.status = $2
       ORDER BY r.created_at DESC
       LIMIT $3 OFFSET $4`,
      [id, 'approved', limit, offset]
    );

    paginatedResponse(res, result.rows, page, limit, total, 'Reviews retrieved successfully');
  } catch (error) {
    console.error('Get product reviews error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5', 'INVALID_RATING', 400);
    }

    const productResult = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    const orderResult = await pool.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = $3`,
      [req.user.id, id, 'delivered']
    );

    if (orderResult.rows.length === 0) {
      return errorResponse(res, 'You can only review products you have purchased', 'NOT_PURCHASED', 400);
    }

    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [req.user.id, id]
    );

    if (existingReview.rows.length > 0) {
      return errorResponse(res, 'You have already reviewed this product', 'ALREADY_REVIEWED', 400);
    }

    const result = await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, id, rating, comment, 'approved']
    );

    successResponse(res, result.rows[0], 'Review added successfully', 201);
  } catch (error) {
    console.error('Add review error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return errorResponse(res, 'Rating must be between 1 and 5', 'INVALID_RATING', 400);
    }

    const result = await pool.query(
      'UPDATE reviews SET rating = COALESCE($1, rating), comment = COALESCE($2, comment), updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [rating, comment, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Review not found', 'REVIEW_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Review updated successfully');
  } catch (error) {
    console.error('Update review error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Review not found', 'REVIEW_NOT_FOUND', 404);
    }

    successResponse(res, null, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview
};
