const pool = require('../config/database');
const shopierService = require('../services/shopierService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Initialize Shopier payment
 */
const initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return errorResponse(res, 'Order ID is required', 'MISSING_ORDER_ID', 400);
    }

    // Get order details
    const orderResult = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return errorResponse(res, 'Order not found', 'ORDER_NOT_FOUND', 404);
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    // Prepare payment data
    const paymentData = shopierService.createPaymentForm({
      orderId: order.id,
      totalAmount: order.total_amount,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      items: itemsResult.rows
    });

    successResponse(res, {
      paymentForm: paymentData,
      shopierUrl: 'https://www.shopier.com/ShowProduct/api_pay4.php'
    }, 'Payment initialized successfully');

  } catch (error) {
    console.error('Initialize payment error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

/**
 * Handle Shopier callback (payment result)
 */
const handleShopierCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    // Verify signature
    const isValid = shopierService.verifyCallback(callbackData);

    if (!isValid) {
      return errorResponse(res, 'Invalid signature', 'INVALID_SIGNATURE', 400);
    }

    const {
      platform_order_id,
      status,
      payment_id,
      payment_status
    } = callbackData;

    // Update order status based on payment result
    let orderStatus = 'pending';

    if (status === '1' || payment_status === 'success') {
      orderStatus = 'processing'; // Payment successful
    } else if (payment_status === 'failed') {
      orderStatus = 'cancelled'; // Payment failed
    }

    // Update order
    await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [orderStatus, platform_order_id]
    );

    // Log payment transaction
    await pool.query(
      `INSERT INTO payment_transactions
       (order_id, payment_gateway, transaction_id, status, amount, response_data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        platform_order_id,
        'shopier',
        payment_id,
        payment_status,
        callbackData.total_order_value,
        JSON.stringify(callbackData)
      ]
    );

    successResponse(res, {
      orderId: platform_order_id,
      status: orderStatus
    }, 'Payment callback processed');

  } catch (error) {
    console.error('Shopier callback error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

/**
 * Get payment status
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `SELECT * FROM payment_transactions
       WHERE order_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'No payment found for this order', 'PAYMENT_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Payment status retrieved');

  } catch (error) {
    console.error('Get payment status error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  initializePayment,
  handleShopierCallback,
  getPaymentStatus
};
