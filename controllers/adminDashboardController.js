const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getStats = async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users WHERE role = $1', ['customer']);
    const ordersResult = await pool.query('SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue FROM orders');
    const productsResult = await pool.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = true');
    const pendingOrdersResult = await pool.query('SELECT COUNT(*) as pending_orders FROM orders WHERE status = $1', ['pending']);

    const stats = {
      total_users: parseInt(usersResult.rows[0].total_users) || 0,
      total_orders: parseInt(ordersResult.rows[0].total_orders) || 0,
      total_revenue: parseFloat(ordersResult.rows[0].total_revenue) || 0,
      total_products: parseInt(productsResult.rows[0].total_products) || 0,
      pending_orders: parseInt(pendingOrdersResult.rows[0].pending_orders) || 0
    };

    successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    console.error('Get stats error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getSales = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let query = `
      SELECT DATE(created_at) as date,
             COUNT(*) as order_count,
             SUM(total_amount) as revenue
      FROM orders
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (date_from) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    query += ' GROUP BY DATE(created_at) ORDER BY date DESC';

    const result = await pool.query(query, params);

    const salesData = result.rows.map(row => ({
      date: row.date,
      order_count: parseInt(row.order_count),
      revenue: parseFloat(row.revenue)
    }));

    successResponse(res, salesData, 'Sales data retrieved successfully');
  } catch (error) {
    console.error('Get sales error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.image_url,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.price) as total_revenue
       FROM products p
       JOIN order_items oi ON p.id = oi.product_id
       GROUP BY p.id, p.name, p.price, p.image_url
       ORDER BY total_sold DESC
       LIMIT $1`,
      [limit]
    );

    const topProducts = result.rows.map(row => ({
      ...row,
      total_sold: parseInt(row.total_sold),
      total_revenue: parseFloat(row.total_revenue)
    }));

    successResponse(res, topProducts, 'Top products retrieved successfully');
  } catch (error) {
    console.error('Get top products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT $1`,
      [limit]
    );

    successResponse(res, result.rows, 'Recent orders retrieved successfully');
  } catch (error) {
    console.error('Get recent orders error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getLowStock = async (req, res) => {
  try {
    const { threshold = 10, limit = 100 } = req.query;

    // Add LIMIT to prevent returning thousands of rows
    const result = await pool.query(
      `SELECT p.id, p.name, p.stock, p.price, p.image_url, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock <= $1 AND p.is_active = true
       ORDER BY p.stock ASC
       LIMIT $2`,
      [threshold, Math.min(parseInt(limit) || 100, 500)]  // Cap at 500 max
    );

    successResponse(res, result.rows, 'Low stock products retrieved successfully');
  } catch (error) {
    console.error('Get low stock error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getStats,
  getSales,
  getTopProducts,
  getRecentOrders,
  getLowStock
};
