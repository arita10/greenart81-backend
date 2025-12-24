const axios = require('axios');
const FormData = require('form-data');

class ImageUploadService {
  constructor() {
    this.imgbbApiKey = process.env.IMGBB_API_KEY;
    this.imgbbUrl = 'https://api.imgbb.com/1/upload';
  }

  /**
   * Upload image to ImgBB
   * @param {Buffer} imageBuffer - Image file buffer from multer
   * @param {String} imageName - Original filename
   * @returns {Promise<Object>} - Returns image URLs
   */
  async uploadToImgBB(imageBuffer, imageName) {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', imageBuffer.toString('base64'));
      formData.append('name', imageName);

      // Upload to ImgBB
      const response = await axios.post(
        `${this.imgbbUrl}?key=${this.imgbbApiKey}`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      if (response.data.success) {
        return {
          success: true,
          url: response.data.data.url,
          displayUrl: response.data.data.display_url,
          thumbUrl: response.data.data.thumb.url,
          mediumUrl: response.data.data.medium?.url || response.data.data.url,
          deleteUrl: response.data.data.delete_url
        };
      } else {
        throw new Error('ImgBB upload failed');
      }
    } catch (error) {
      console.error('ImgBB upload error:', error.message);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple images
   * @param {Array} files - Array of file buffers from multer
   * @returns {Promise<Array>} - Array of uploaded image URLs
   */
  async uploadMultiple(files) {
    try {
      const uploadPromises = files.map(file =>
        this.uploadToImgBB(file.buffer, file.originalname)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Multiple upload failed: ${error.message}`);
    }
  }
}

module.exports = new ImageUploadService();
