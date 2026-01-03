const imageUploadService = require('../services/imageUploadService');

/**
 * Upload single image
 */
exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        code: 'NO_FILE'
      });
    }

    // Upload to ImgBB
    const result = await imageUploadService.uploadToImgBB(
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      success: true,
      data: {
        url: result.url,
        displayUrl: result.displayUrl,
        thumbUrl: result.thumbUrl,
        mediumUrl: result.mediumUrl,
        deleteUrl: result.deleteUrl
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image upload failed',
      code: 'UPLOAD_FAILED'
    });
  }
};

/**
 * Upload multiple images (up to 5)
 */
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided',
        code: 'NO_FILES'
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 images allowed',
        code: 'TOO_MANY_FILES'
      });
    }

    // Upload all images
    const results = await imageUploadService.uploadMultiple(req.files);

    res.json({
      success: true,
      data: {
        images: results.map(r => ({
          url: r.url,
          displayUrl: r.displayUrl,
          thumbUrl: r.thumbUrl,
          mediumUrl: r.mediumUrl,
          deleteUrl: r.deleteUrl
        })),
        count: results.length
      },
      message: `${results.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Images upload failed',
      code: 'UPLOAD_FAILED'
    });
  }
};

/**
 * Upload product image (specific for products)
 */
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No product image provided',
        code: 'NO_FILE'
      });
    }

    // Upload to Cloudinary (via uploadToImgBB which now uses Cloudinary)
    const result = await imageUploadService.uploadToImgBB(
      req.file.buffer,
      `product_${Date.now()}_${req.file.originalname}`
    );

    res.json({
      success: true,
      data: {
        imageUrl: result.url,
        thumbUrl: result.thumbUrl,
        mediumUrl: result.mediumUrl
      },
      message: 'Product image uploaded successfully'
    });
  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Product image upload failed',
      code: 'UPLOAD_FAILED'
    });
  }
};

/**
 * Upload payment slip image (for QR payment verification)
 */
exports.uploadPaymentSlip = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No payment slip image provided',
        code: 'NO_FILE'
      });
    }

    // Upload to Cloudinary with payment_slip folder
    const result = await imageUploadService.uploadToCloudinary(
      req.file.buffer,
      `payment_slip_${Date.now()}_${req.file.originalname}`
    );

    res.json({
      success: true,
      data: {
        url: result.url,
        slipImageUrl: result.url,
        thumbUrl: result.thumbUrl,
        mediumUrl: result.mediumUrl
      },
      message: 'Payment slip uploaded successfully'
    });
  } catch (error) {
    console.error('Payment slip upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment slip upload failed',
      code: 'UPLOAD_FAILED'
    });
  }
};
