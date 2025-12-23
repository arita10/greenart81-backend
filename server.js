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

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GreenArt81 E-commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      wishlist: '/api/wishlist',
      reviews: '/api/reviews',
      admin: '/api/admin',
      search: '/api/search'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
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
