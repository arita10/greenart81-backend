const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// Helper function to transform order data for frontend consistency
const transformOrder = (order, items = null) => {
  const transformed = {
    ...order,
    id: String(order.id), // Ensure ID is string
    _id: String(order.id), // MongoDB-style _id for frontend compatibility
    userId: String(order.user_id),
    totalAmount: parseFloat(order.total_amount) || 0,
    shippingAddress: order.shipping_address,
    paymentMethod: order.payment_method,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  };

  if (items) {
    transformed.items = items.map(item => ({
      ...item,
      id: String(item.id),
      orderId: String(item.order_id),
      productId: String(item.product_id),
      price: parseFloat(item.price) || 0
    }));
  }

  return transformed;
};

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

    // Transform orders for frontend consistency
    const transformedOrders = result.rows.map(order => transformOrder(order));

    paginatedResponse(res, transformedOrders, page, limit, total, 'Orders retrieved successfully');
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

    // Transform order with items for frontend consistency
    const order = transformOrder(orderResult.rows[0], itemsResult.rows);

    successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    // Normalize body keys to lowercase for flexible field name matching
    const body = {};
    for (const key in req.body) {
      body[key.toLowerCase().trim()] = req.body[key];
    }

    // Extract items directly from req.body (case-sensitive)
    const items = req.body.items || req.body.Items;

    // Extract fields with fallback to camelCase variations
    const shipping_address = body.shipping_address ?? body.shippingaddress ?? req.body.shippingAddress;
    const payment_method = body.payment_method ?? body.paymentmethod ?? req.body.paymentMethod;
    const total_amount = body.total_amount ?? body.totalamount ?? req.body.totalAmount;

    // Log received data for debugging
    console.log('📦 Order creation request:', {
      hasItems: !!items,
      itemsCount: items?.length,
      hasShippingAddress: !!shipping_address,
      hasPaymentMethod: !!payment_method,
      hasTotalAmount: !!total_amount,
      receivedKeys: Object.keys(req.body)
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Items validation failed:', items);
      return errorResponse(res, 'Items are required', 'MISSING_FIELDS', 400);
    }

    if (!shipping_address || !payment_method || !total_amount) {
      console.log('❌ Required fields missing:', {
        shipping_address,
        payment_method,
        total_amount
      });
      return errorResponse(res, 'Shipping address, payment method, and total amount are required', 'MISSING_FIELDS', 400);
    }

    await client.query('BEGIN');

    // Normalize items array to handle both camelCase and snake_case
    const normalizedItems = items.map((item, index) => {
      // Try multiple variations of product ID field
      const product_id = item.product_id ?? item.productId ?? item.id ?? item.product?.id ?? item._id;
      const quantity = item.quantity ?? item.qty ?? 1;
      const price = item.price ?? item.salePrice ?? item.originalPrice ?? 0;

      console.log(`Item ${index}:`, {
        originalItem: item,
        extracted: { product_id, quantity, price }
      });

      if (!product_id) {
        console.error(`❌ Product ID missing for item ${index}:`, item);
      }

      return { product_id, quantity, price };
    });

    // Validate all items have product_id before starting transaction
    for (let i = 0; i < normalizedItems.length; i++) {
      if (!normalizedItems[i].product_id) {
        console.error(`❌ Missing product_id in item ${i}:`, items[i]);
        return errorResponse(
          res,
          `Missing product ID for item at index ${i}. Please ensure each item has 'productId' or 'product_id' field.`,
          'MISSING_PRODUCT_ID',
          400
        );
      }
    }

    for (const item of normalizedItems) {
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

    for (const item of normalizedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    console.log('✅ Order created successfully:', order.id);

    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    // Transform order for frontend consistency
    successResponse(res, transformOrder(order), 'Order created successfully', 201);
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

    // Transform order for frontend consistency
    successResponse(res, transformOrder(result.rows[0]), 'Order cancelled successfully');
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
