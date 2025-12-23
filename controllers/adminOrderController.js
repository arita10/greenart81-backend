const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, date_from, date_to } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = `SELECT o.*, u.name as customer_name, u.email as customer_email
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (date_from) {
      query += ` AND o.created_at >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND o.created_at <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    const countQuery = query.replace('SELECT o.*, u.name as customer_name, u.email as customer_email', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    paginatedResponse(res, result.rows, page, limit, total, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Admin get all orders error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return errorResponse(res, 'Order not found', 'ORDER_NOT_FOUND', 404);
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };

    successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Admin get order by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 'Valid status is required (pending, processing, shipped, delivered, cancelled)', 'INVALID_STATUS', 400);
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Order not found', 'ORDER_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Order status updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Order not found', 'ORDER_NOT_FOUND', 404);
    }

    successResponse(res, null, 'Order deleted successfully');
  } catch (error) {
    console.error('Delete order error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
