const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// ==================== ADMIN QR CODE MANAGEMENT ====================

/**
 * Get all QR codes (Admin)
 */
exports.getAllQRCodes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qr.*, u.name as created_by_name
       FROM payment_qr_codes qr
       LEFT JOIN users u ON qr.created_by = u.id
       ORDER BY qr.created_at DESC`
    );

    successResponse(res, result.rows, 'QR codes retrieved successfully');
  } catch (error) {
    console.error('Get QR codes error:', error);
    errorResponse(res, 'Failed to retrieve QR codes', 'SERVER_ERROR', 500);
  }
};

/**
 * Get active QR codes (Public - for customers to see payment options)
 */
exports.getActiveQRCodes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, bank_name, account_name, account_number, qr_code_image_url, payment_type
       FROM payment_qr_codes
       WHERE is_active = true
       ORDER BY created_at DESC`
    );

    successResponse(res, result.rows, 'Active QR codes retrieved successfully');
  } catch (error) {
    console.error('Get active QR codes error:', error);
    errorResponse(res, 'Failed to retrieve QR codes', 'SERVER_ERROR', 500);
  }
};

/**
 * Create QR code (Admin)
 */
exports.createQRCode = async (req, res) => {
  try {
    const { bank_name, account_name, account_number, qr_code_image_url, payment_type } = req.body;

    if (!bank_name || !account_name || !qr_code_image_url) {
      return errorResponse(res, 'Bank name, account name, and QR code image are required', 'MISSING_FIELDS', 400);
    }

    const result = await pool.query(
      `INSERT INTO payment_qr_codes (bank_name, account_name, account_number, qr_code_image_url, payment_type, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [bank_name, account_name, account_number || null, qr_code_image_url, payment_type || 'bank_transfer', req.user.id]
    );

    successResponse(res, result.rows[0], 'QR code created successfully', 201);
  } catch (error) {
    console.error('Create QR code error:', error);
    errorResponse(res, 'Failed to create QR code', 'SERVER_ERROR', 500);
  }
};

/**
 * Update QR code (Admin)
 */
exports.updateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, account_name, account_number, qr_code_image_url, payment_type, is_active } = req.body;

    const result = await pool.query(
      `UPDATE payment_qr_codes
       SET bank_name = COALESCE($1, bank_name),
           account_name = COALESCE($2, account_name),
           account_number = COALESCE($3, account_number),
           qr_code_image_url = COALESCE($4, qr_code_image_url),
           payment_type = COALESCE($5, payment_type),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [bank_name, account_name, account_number, qr_code_image_url, payment_type, is_active, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'QR code not found', 'NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'QR code updated successfully');
  } catch (error) {
    console.error('Update QR code error:', error);
    errorResponse(res, 'Failed to update QR code', 'SERVER_ERROR', 500);
  }
};

/**
 * Delete QR code (Admin)
 */
exports.deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM payment_qr_codes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'QR code not found', 'NOT_FOUND', 404);
    }

    successResponse(res, null, 'QR code deleted successfully');
  } catch (error) {
    console.error('Delete QR code error:', error);
    errorResponse(res, 'Failed to delete QR code', 'SERVER_ERROR', 500);
  }
};

// ==================== CUSTOMER PAYMENT SLIP UPLOAD ====================

/**
 * Upload payment slip (Customer)
 */
exports.uploadPaymentSlip = async (req, res) => {
  try {
    const { order_id, qr_code_id, slip_image_url, amount, payment_date, transaction_reference, notes } = req.body;

    if (!order_id || !slip_image_url || !amount) {
      return errorResponse(res, 'Order ID, slip image, and amount are required', 'MISSING_FIELDS', 400);
    }

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [order_id, req.user.id]
    );

    if (orderCheck.rows.length === 0) {
      return errorResponse(res, 'Order not found or access denied', 'NOT_FOUND', 404);
    }

    // Check if slip already uploaded for this order
    const existingSlip = await pool.query(
      'SELECT * FROM payment_slips WHERE order_id = $1 AND status != $2',
      [order_id, 'rejected']
    );

    if (existingSlip.rows.length > 0) {
      return errorResponse(res, 'Payment slip already uploaded for this order', 'ALREADY_EXISTS', 400);
    }

    const result = await pool.query(
      `INSERT INTO payment_slips (order_id, user_id, qr_code_id, slip_image_url, amount, payment_date, transaction_reference, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [order_id, req.user.id, qr_code_id || null, slip_image_url, amount, payment_date || new Date(), transaction_reference || null, notes || null]
    );

    // Update order payment status
    await pool.query(
      `UPDATE orders
       SET payment_status = 'pending_verification', payment_method = 'qr_code', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [order_id]
    );

    successResponse(res, result.rows[0], 'Payment slip uploaded successfully. Waiting for verification.', 201);
  } catch (error) {
    console.error('Upload payment slip error:', error);
    errorResponse(res, 'Failed to upload payment slip', 'SERVER_ERROR', 500);
  }
};

/**
 * Get my payment slips (Customer)
 */
exports.getMyPaymentSlips = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ps.*,
              o.order_number, o.total_amount as order_total,
              qr.bank_name, qr.account_name,
              v.name as verified_by_name
       FROM payment_slips ps
       LEFT JOIN orders o ON ps.order_id = o.id
       LEFT JOIN payment_qr_codes qr ON ps.qr_code_id = qr.id
       LEFT JOIN users v ON ps.verified_by = v.id
       WHERE ps.user_id = $1
       ORDER BY ps.created_at DESC`,
      [req.user.id]
    );

    successResponse(res, result.rows, 'Payment slips retrieved successfully');
  } catch (error) {
    console.error('Get my payment slips error:', error);
    errorResponse(res, 'Failed to retrieve payment slips', 'SERVER_ERROR', 500);
  }
};

/**
 * Get payment slip by order ID (Customer)
 */
exports.getPaymentSlipByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `SELECT ps.*,
              qr.bank_name, qr.account_name, qr.qr_code_image_url,
              v.name as verified_by_name
       FROM payment_slips ps
       LEFT JOIN payment_qr_codes qr ON ps.qr_code_id = qr.id
       LEFT JOIN users v ON ps.verified_by = v.id
       WHERE ps.order_id = $1 AND ps.user_id = $2`,
      [orderId, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Payment slip not found', 'NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Payment slip retrieved successfully');
  } catch (error) {
    console.error('Get payment slip by order error:', error);
    errorResponse(res, 'Failed to retrieve payment slip', 'SERVER_ERROR', 500);
  }
};

// ==================== ADMIN PAYMENT VERIFICATION ====================

/**
 * Get all payment slips (Admin)
 */
exports.getAllPaymentSlips = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT ps.*,
             u.name as customer_name, u.email as customer_email,
             o.order_number, o.total_amount as order_total, o.payment_status,
             qr.bank_name, qr.account_name,
             v.name as verified_by_name
      FROM payment_slips ps
      LEFT JOIN users u ON ps.user_id = u.id
      LEFT JOIN orders o ON ps.order_id = o.id
      LEFT JOIN payment_qr_codes qr ON ps.qr_code_id = qr.id
      LEFT JOIN users v ON ps.verified_by = v.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE ps.status = $1';
      params.push(status);
    }

    query += ' ORDER BY ps.created_at DESC';

    const result = await pool.query(query, params);

    successResponse(res, result.rows, 'Payment slips retrieved successfully');
  } catch (error) {
    console.error('Get all payment slips error:', error);
    errorResponse(res, 'Failed to retrieve payment slips', 'SERVER_ERROR', 500);
  }
};

/**
 * Verify/Reject payment slip (Admin)
 */
exports.verifyPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verification_notes } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return errorResponse(res, 'Status must be either approved or rejected', 'INVALID_STATUS', 400);
    }

    // Get payment slip
    const slipCheck = await pool.query('SELECT * FROM payment_slips WHERE id = $1', [id]);

    if (slipCheck.rows.length === 0) {
      return errorResponse(res, 'Payment slip not found', 'NOT_FOUND', 404);
    }

    const slip = slipCheck.rows[0];

    // Update payment slip
    const result = await pool.query(
      `UPDATE payment_slips
       SET status = $1,
           verified_by = $2,
           verified_at = CURRENT_TIMESTAMP,
           verification_notes = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, req.user.id, verification_notes || null, id]
    );

    // Update order status based on verification
    if (status === 'approved') {
      await pool.query(
        `UPDATE orders
         SET payment_status = 'completed', order_status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [slip.order_id]
      );
    } else if (status === 'rejected') {
      await pool.query(
        `UPDATE orders
         SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [slip.order_id]
      );
    }

    successResponse(res, result.rows[0], `Payment slip ${status} successfully`);
  } catch (error) {
    console.error('Verify payment slip error:', error);
    errorResponse(res, 'Failed to verify payment slip', 'SERVER_ERROR', 500);
  }
};
