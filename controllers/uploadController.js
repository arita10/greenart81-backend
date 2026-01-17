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
    console.log('📤 Payment slip upload request received');
    console.log('File info:', {
      hasFile: !!req.file,
      fieldname: req.file?.fieldname,
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      bufferLength: req.file?.buffer?.length
    });

    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({
        success: false,
        error: 'No payment slip image provided',
        code: 'NO_FILE'
      });
    }

    // Check Cloudinary configuration
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
    console.log('Cloudinary configured:', cloudinaryConfigured);
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'NOT SET');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'set' : 'NOT SET');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'set' : 'NOT SET');

    // Upload to Cloudinary with payment_slip folder
    const filename = `payment_slip_${Date.now()}_${req.file.originalname}`;
    console.log('Uploading to Cloudinary with filename:', filename);

    const result = await imageUploadService.uploadToCloudinary(
      req.file.buffer,
      filename
    );

    console.log('✅ Payment slip uploaded successfully:', result.url);

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
    console.error('❌ Payment slip upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment slip upload failed',
      code: 'UPLOAD_FAILED',
      details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

/**
 * Upload multiple product images (up to 10)
 */
exports.uploadMultipleProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No product images provided',
        code: 'NO_FILES'
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 images allowed per product',
        code: 'TOO_MANY_FILES'
      });
    }

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map((file, index) =>
      imageUploadService.uploadToCloudinary(
        file.buffer,
        `product_${Date.now()}_${index}_${file.originalname}`
      )
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        images: results.map((r, index) => ({
          url: r.url,
          thumbUrl: r.thumbUrl,
          mediumUrl: r.mediumUrl,
          sortOrder: index
        })),
        count: results.length
      },
      message: `${results.length} product images uploaded successfully`
    });
  } catch (error) {
    console.error('Multiple product images upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Product images upload failed',
      code: 'UPLOAD_FAILED'
    });
  }
};
