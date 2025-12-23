const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT r.*, u.name as user_name, p.name as product_name
                 FROM reviews r
                 JOIN users u ON r.user_id = u.id
                 JOIN products p ON r.product_id = p.id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const countQuery = query.replace('SELECT r.*, u.name as user_name, p.name as product_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    paginatedResponse(res, result.rows, page, limit, total, 'Reviews retrieved successfully');
  } catch (error) {
    console.error('Get all reviews error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['approved', id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Review not found', 'REVIEW_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Review approved successfully');
  } catch (error) {
    console.error('Approve review error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['rejected', id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Review not found', 'REVIEW_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Review rejected successfully');
  } catch (error) {
    console.error('Reject review error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);

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
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview
};
