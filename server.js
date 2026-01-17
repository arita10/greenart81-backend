process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const qrPaymentRoutes = require('./routes/qrPaymentRoutes');
const productImagesRoutes = require('./routes/productImagesRoutes');

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GreenArt81 E-commerce API',
    version: '1.0.1',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      wishlist: '/api/wishlist',
      reviews: '/api/reviews',
      admin: '/api/admin',
      search: '/api/search',
      payment: '/api/payment',
      upload: '/api/upload'
    }
  });
});

// One-time database initialization endpoint
app.post('/api/init-database', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const pool = require('./config/database');

    const sqlFilePath = path.join(__dirname, 'config/db-init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sql);

    res.json({
      success: true,
      message: 'Database initialized successfully! Tables created and sample data loaded.',
      note: 'Default admin: admin@greenart81.com / admin123 - Please change password!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      note: 'Database initialization failed. Check if tables already exist.'
    });
  }
});

// Make user admin endpoint (one-time use for setup)
app.post('/api/make-admin', async (req, res) => {
  try {
    const pool = require('./config/database');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
      ['admin', email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User promoted to admin successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create working admin account (one-time setup)
app.post('/api/setup-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const pool = require('./config/database');

    const email = 'admin@greenart81.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete old admin if exists
    await pool.query('DELETE FROM users WHERE email = $1', [email]);

    // Create new admin with correct hashed password
    const result = await pool.query(
      'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role',
      [email, hashedPassword, 'Admin User', '1234567890', 'admin']
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Admin account created successfully!',
      credentials: {
        email: 'admin@greenart81.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products', productImagesRoutes); // Product images endpoints
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/qr-payment', qrPaymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
});

// Global error handler with multer error handling
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum allowed is 5MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field name.',
        code: 'UNEXPECTED_FIELD'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code
    });
  }

  // Handle file type errors
  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   GreenArt81 E-commerce API Server    ║
    ╠════════════════════════════════════════╣
    ║   Server running on port ${PORT}         ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
    ║   API Documentation: http://localhost:${PORT}  ║
    ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
