const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, name, phone, address, role, is_active, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    const countQuery = query.replace('SELECT id, email, name, phone, address, role, is_active, created_at, updated_at', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    paginatedResponse(res, result.rows, page, limit, total, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get all users error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email, name, phone, address, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'User retrieved successfully');
  } catch (error) {
    console.error('Get user by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return errorResponse(res, 'Valid role is required (customer, admin)', 'INVALID_ROLE', 400);
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, phone, role, is_active, created_at, updated_at',
      [role, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'User role updated successfully');
  } catch (error) {
    console.error('Update user role error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return errorResponse(res, 'is_active must be true or false', 'INVALID_STATUS', 400);
    }

    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, phone, role, is_active, created_at, updated_at',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'User status updated successfully');
  } catch (error) {
    console.error('Update user status error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser
};
