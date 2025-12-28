const express = require('express');
const router = express.Router();
const qrPaymentController = require('../controllers/qrPaymentController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// ==================== PUBLIC ROUTES ====================

// Get active QR codes (for customers to see payment options)
router.get('/qr-codes/active', qrPaymentController.getActiveQRCodes);

// ==================== CUSTOMER ROUTES ====================

// Upload payment slip
router.post('/slips', authenticateToken, qrPaymentController.uploadPaymentSlip);

// Get my payment slips
router.get('/slips/my-slips', authenticateToken, qrPaymentController.getMyPaymentSlips);

// Get payment slip by order ID
router.get('/slips/order/:orderId', authenticateToken, qrPaymentController.getPaymentSlipByOrder);

// ==================== ADMIN ROUTES ====================

// QR Code Management
router.get('/qr-codes', authenticateToken, isAdmin, qrPaymentController.getAllQRCodes);
router.post('/qr-codes', authenticateToken, isAdmin, qrPaymentController.createQRCode);
router.put('/qr-codes/:id', authenticateToken, isAdmin, qrPaymentController.updateQRCode);
router.delete('/qr-codes/:id', authenticateToken, isAdmin, qrPaymentController.deleteQRCode);

// Payment Slip Verification
router.get('/slips/all', authenticateToken, isAdmin, qrPaymentController.getAllPaymentSlips);
router.put('/slips/:id/verify', authenticateToken, isAdmin, qrPaymentController.verifyPaymentSlip);

module.exports = router;
