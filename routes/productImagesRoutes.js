const express = require('express');
const router = express.Router();
const productImagesController = require('../controllers/productImagesController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public route - get product images
router.get('/:productId/images', productImagesController.getProductImages);

// Admin routes
router.post('/:productId/images', authenticateToken, isAdmin, productImagesController.addProductImages);
router.put('/images/:imageId', authenticateToken, isAdmin, productImagesController.updateProductImage);
router.delete('/images/:imageId', authenticateToken, isAdmin, productImagesController.deleteProductImage);
router.put('/:productId/images/reorder', authenticateToken, isAdmin, productImagesController.reorderProductImages);

module.exports = router;
