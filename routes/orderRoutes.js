const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.post('/', authenticateToken, orderController.createOrder);
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
