const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY name ASC'
    );

    successResponse(res, result.rows, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get all categories error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllCategories
};
