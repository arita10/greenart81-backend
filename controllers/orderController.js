const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders WHERE user_id = $1';
    const params = [req.user.id];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    paginatedResponse(res, result.rows, page, limit, total, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Get my orders error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
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
    console.error('Get order by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { items, shipping_address, payment_method, total_amount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'Items are required', 'MISSING_FIELDS', 400);
    }

    if (!shipping_address || !payment_method || !total_amount) {
      return errorResponse(res, 'Shipping address, payment method, and total amount are required', 'MISSING_FIELDS', 400);
    }

    await client.query('BEGIN');

    for (const item of items) {
      const productResult = await client.query(
        'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return errorResponse(res, `Product ${item.product_id} not found`, 'PRODUCT_NOT_FOUND', 404);
      }

      if (productResult.rows[0].stock < item.quantity) {
        await client.query('ROLLBACK');
        return errorResponse(res, `Insufficient stock for product ${item.product_id}`, 'INSUFFICIENT_STOCK', 400);
      }
    }

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, total_amount, shipping_address, payment_method, 'pending']
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  } finally {
    client.release();
  }
};

const cancelOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return errorResponse(res, 'Order not found', 'ORDER_NOT_FOUND', 404);
    }

    const order = orderResult.rows[0];

    if (order.status !== 'pending') {
      return errorResponse(res, 'Only pending orders can be cancelled', 'INVALID_STATUS', 400);
    }

    await client.query('BEGIN');

    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [id]
    );

    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    const result = await client.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    await client.query('COMMIT');

    successResponse(res, result.rows[0], 'Order cancelled successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  } finally {
    client.release();
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder
};
