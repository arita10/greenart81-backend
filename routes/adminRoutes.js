const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

const adminProductController = require('../controllers/adminProductController');
const adminOrderController = require('../controllers/adminOrderController');
const adminUserController = require('../controllers/adminUserController');
const adminCategoryController = require('../controllers/adminCategoryController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminReviewController = require('../controllers/adminReviewController');

router.use(authenticateToken, isAdmin);

router.get('/products', adminProductController.getAllProducts);
router.post('/products', adminProductController.createProduct);
router.put('/products/:id', adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);
router.put('/products/:id/stock', adminProductController.updateStock);
router.put('/products/:id/toggle', adminProductController.toggleActiveStatus);
router.post('/products/bulk-upload', adminProductController.bulkUpload);

router.get('/orders', adminOrderController.getAllOrders);
router.get('/orders/:id', adminOrderController.getOrderById);
router.put('/orders/:id/status', adminOrderController.updateOrderStatus);
router.delete('/orders/:id', adminOrderController.deleteOrder);

router.get('/users', adminUserController.getAllUsers);
router.get('/users/:id', adminUserController.getUserById);
router.put('/users/:id/role', adminUserController.updateUserRole);
router.put('/users/:id/status', adminUserController.updateUserStatus);
router.delete('/users/:id', adminUserController.deleteUser);

router.get('/categories', adminCategoryController.getAllCategories);
router.post('/categories', adminCategoryController.createCategory);
router.put('/categories/:id', adminCategoryController.updateCategory);
router.delete('/categories/:id', adminCategoryController.deleteCategory);

router.get('/dashboard/stats', adminDashboardController.getStats);
router.get('/dashboard/sales', adminDashboardController.getSales);
router.get('/dashboard/top-products', adminDashboardController.getTopProducts);
router.get('/dashboard/recent-orders', adminDashboardController.getRecentOrders);
router.get('/dashboard/low-stock', adminDashboardController.getLowStock);

router.get('/reviews', adminReviewController.getAllReviews);
router.put('/reviews/:id/approve', adminReviewController.approveReview);
router.put('/reviews/:id/reject', adminReviewController.rejectReview);
router.delete('/reviews/:id', adminReviewController.deleteReview);

module.exports = router;
