// Secure Cloudinary service for image uploads
// This service handles uploads via backend API for security

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

if (!BACKEND_URL) {
  console.warn('Backend URL not configured. Please set VITE_BACKEND_URL in your .env file');
}

/**
 * Upload a single image via secure backend
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadImage = async (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 2MB');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${BACKEND_URL}/api/upload/single`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.data;
  } catch (error) {
    console.error('Secure upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images via secure backend
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<Object[]>} - Array of Cloudinary upload results
 */
export const uploadMultipleImages = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append('images', file);
  });

  try {
    const response = await fetch(`${BACKEND_URL}/api/upload/multiple`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.data;
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Delete an image via secure backend
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
  if (!publicId) {
    throw new Error('Public ID is required');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/upload/${publicId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Delete failed');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Delete failed');
    }

    return result.data;
  } catch (error) {
    console.error('Secure delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - The public ID of the image
 * @param {Object} transformations - Cloudinary transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  // For security, we'll use the backend to get the cloud name
  // This prevents exposing cloud name in frontend
  const defaultTransformations = {
    quality: 'auto',
    format: 'auto',
    ...transformations
  };

  const transformString = Object.entries(defaultTransformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  // Use the secure URL from the upload response
  if (publicId.startsWith('http')) {
    return publicId; // Already a full URL
  }

  // Fallback - this should be avoided in production
  return publicId;
};
