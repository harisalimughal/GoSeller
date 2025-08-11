const cloudinary = require('cloudinary').v2;
const ApiError = require('../utils/ApiError');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  /**
   * Upload single image to Cloudinary
   * @param {Buffer} fileBuffer - Image buffer
   * @param {string} folder - Folder path in Cloudinary
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadImage(fileBuffer, folder = 'gosellr', options = {}) {
    try {
      const uploadOptions = {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        ...options
      };

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(new ApiError(500, 'Image upload failed', error.message));
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes
              });
            }
          }
        ).end(fileBuffer);
      });
    } catch (error) {
      throw new ApiError(500, 'Image upload failed', error.message);
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * @param {Array<Buffer>} fileBuffers - Array of image buffers
   * @param {string} folder - Folder path in Cloudinary
   * @param {Object} options - Additional options
   * @returns {Promise<Array<Object>>} Array of upload results
   */
  static async uploadMultipleImages(fileBuffers, folder = 'gosellr', options = {}) {
    try {
      const uploadPromises = fileBuffers.map((buffer, index) => 
        this.uploadImage(buffer, folder, { ...options, public_id: `${folder}_${Date.now()}_${index}` })
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new ApiError(500, 'Multiple image upload failed', error.message);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Public ID of the image
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteImage(publicId) {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new ApiError(500, 'Image deletion failed', error.message);
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param {string} publicId - Public ID of the image
   * @param {Object} transformations - Cloudinary transformations
   * @returns {string} Optimized image URL
   */
  static getOptimizedUrl(publicId, transformations = {}) {
    const defaultTransformations = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...transformations
    };

    return cloudinary.url(publicId, defaultTransformations);
  }

  /**
   * Generate thumbnail URL
   * @param {string} publicId - Public ID of the image
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   * @returns {string} Thumbnail URL
   */
  static getThumbnailUrl(publicId, width = 300, height = 300) {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto:good'
    });
  }

  /**
   * Upload any file type to Cloudinary
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadFile(fileBuffer, options = {}) {
    try {
      const uploadOptions = {
        folder: 'gosellr',
        resource_type: 'auto',
        ...options
      };

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(new ApiError(500, 'File upload failed', error.message));
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                bytes: result.bytes,
                resource_type: result.resource_type
              });
            }
          }
        ).end(fileBuffer);
      });
    } catch (error) {
      throw new ApiError(500, 'File upload failed', error.message);
    }
  }

  /**
   * Validate file before upload
   * @param {Object} file - File object
   * @returns {boolean} Validation result
   */
  static validateFile(file) {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB for documents

    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError(400, 'Invalid file type. Only images, PDF, and Word documents are allowed.');
    }

    if (file.size > maxSize) {
      throw new ApiError(400, 'File size too large. Maximum size is 10MB.');
    }

    return true;
  }
}

module.exports = CloudinaryService; 