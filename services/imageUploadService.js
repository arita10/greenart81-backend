const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

class ImageUploadService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dq0dbdqmo',
      api_key: process.env.CLOUDINARY_API_KEY || '773623456949753',
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  /**
   * Upload image to Cloudinary
   * @param {Buffer} imageBuffer - Image file buffer from multer
   * @param {String} imageName - Original filename
   * @param {String} folder - Optional folder path (default: greenart81/products)
   * @returns {Promise<Object>} - Returns image URLs
   */
  async uploadToCloudinary(imageBuffer, imageName, folder = 'greenart81/products') {
    try {
      return new Promise((resolve, reject) => {
        // Determine public_id based on filename
        const isPaymentSlip = imageName.includes('payment_slip');
        const publicId = isPaymentSlip
          ? imageName.split('.')[0]
          : `product_${Date.now()}_${imageName.split('.')[0]}`;

        // Create upload stream
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: isPaymentSlip ? 'greenart81/payment_slips' : folder,
            public_id: publicId,
            resource_type: 'auto',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              resolve({
                success: true,
                url: result.secure_url,
                displayUrl: result.secure_url,
                thumbUrl: cloudinary.url(result.public_id, {
                  width: 200,
                  height: 200,
                  crop: 'fill',
                  quality: 'auto',
                  fetch_format: 'auto'
                }),
                mediumUrl: cloudinary.url(result.public_id, {
                  width: 500,
                  height: 500,
                  crop: 'limit',
                  quality: 'auto',
                  fetch_format: 'auto'
                }),
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height
              });
            }
          }
        );

        // Convert buffer to stream and pipe to Cloudinary
        streamifier.createReadStream(imageBuffer).pipe(uploadStream);
      });
    } catch (error) {
      console.error('Image upload error:', error.message);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Backward compatibility - keep the old method name
  async uploadToImgBB(imageBuffer, imageName) {
    return this.uploadToCloudinary(imageBuffer, imageName);
  }

  /**
   * Upload multiple images
   * @param {Array} files - Array of file buffers from multer
   * @returns {Promise<Array>} - Array of uploaded image URLs
   */
  async uploadMultiple(files) {
    try {
      const uploadPromises = files.map(file =>
        this.uploadToCloudinary(file.buffer, file.originalname)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Multiple upload failed: ${error.message}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {String} publicId - Cloudinary public ID
   * @returns {Promise<Object>}
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        message: result.result === 'ok' ? 'Image deleted successfully' : 'Image not found'
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }
}

module.exports = new ImageUploadService();
