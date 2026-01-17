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
// Accepts field names: 'slip', 'image', 'file', 'paymentSlip'
router.post(
  '/payment-slip',
  authenticateToken,
  upload.any(),  // Accept any field name
  (req, res, next) => {
    // If files were uploaded with any() middleware, get the first one
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
      console.log('📎 File received with field name:', req.file.fieldname);
    }
    next();
  },
  uploadController.uploadPaymentSlip
);

// Upload multiple product images (admin only) - up to 10 images
router.post(
  '/product/multiple',
  authenticateToken,
  isAdmin,
  upload.array('images', 10),
  uploadController.uploadMultipleProductImages
);

module.exports = router;
