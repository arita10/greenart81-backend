const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');

    successResponse(res, result.rows, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get all categories error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return errorResponse(res, 'Name is required', 'MISSING_FIELDS', 400);
    }

    const result = await pool.query(
      'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description, image_url]
    );

    successResponse(res, result.rows[0], 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, image_url, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Category not found', 'CATEGORY_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Category not found', 'CATEGORY_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
