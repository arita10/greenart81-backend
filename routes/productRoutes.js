const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

router.get('/categories', categoryController.getAllCategories);

module.exports = router;
