const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return errorResponse(res, 'Email, password, and name are required', 'MISSING_FIELDS', 400);
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return errorResponse(res, 'Email already registered', 'EMAIL_EXISTS', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, phone, role, created_at',
      [email, hashedPassword, name, phone || null, 'customer']
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    successResponse(res, { user, token }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 'Server error during registration', 'SERVER_ERROR', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 'MISSING_FIELDS', 400);
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return errorResponse(res, 'Account is disabled', 'ACCOUNT_DISABLED', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const { password: _, ...userWithoutPassword } = user;

    successResponse(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Server error during login', 'SERVER_ERROR', 500);
  }
};

const logout = async (req, res) => {
  successResponse(res, null, 'Logout successful');
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, address, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'User profile retrieved successfully');
  } catch (error) {
    console.error('GetMe error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), address = COALESCE($3, address), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, name, phone, address, role, created_at, updated_at',
      [name, phone, address, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return errorResponse(res, 'Old password and new password are required', 'MISSING_FIELDS', 400);
    }

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, result.rows[0].password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Old password is incorrect', 'INVALID_PASSWORD', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
};
