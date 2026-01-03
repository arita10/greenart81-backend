const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Upload single image (any authenticated user)
router.post(
  '/single',
  authenticateToken,
  upload.single('image'),
  uploadController.uploadSingle
);

// Upload multiple images (up to 5)
router.post(
  '/multiple',
  authenticateToken,
  upload.array('images', 5),
  uploadController.uploadMultiple
);

// Upload product image (admin only)
router.post(
  '/product',
  authenticateToken,
  isAdmin,
  upload.single('image'),
  uploadController.uploadProductImage
);

// Upload payment slip image (any authenticated user)
router.post(
  '/payment-slip',
  authenticateToken,
  upload.single('slip'),
  uploadController.uploadPaymentSlip
);

module.exports = router;
