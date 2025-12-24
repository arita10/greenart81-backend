const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Initialize payment (customer creates payment)
router.post('/initialize', authenticateToken, paymentController.initializePayment);

// Shopier callback (Shopier sends payment result here)
router.post('/shopier/callback', paymentController.handleShopierCallback);

// Get payment status
router.get('/status/:orderId', authenticateToken, paymentController.getPaymentStatus);

module.exports = router;
