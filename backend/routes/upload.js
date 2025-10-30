import express from 'express';
import multer from 'multer';
import { uploader } from '../lib/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * POST /api/upload/single
 * Upload a single image to Cloudinary via backend
 */
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    // Upload to Cloudinary using the backend service
    const result = await uploader.upload(req.file.buffer, {
      resource_type: 'image',
      folder: 'cooktopia/recipes', // Organize images in a folder
      transformation: [
        { quality: 'auto', format: 'auto' },
        { width: 1200, height: 1200, crop: 'limit' } // Limit max dimensions
      ]
    });

    res.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Single image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
});

/**
 * POST /api/upload/multiple
 * Upload multiple images to Cloudinary via backend
 */
router.post('/multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image files provided' 
      });
    }

    const uploadPromises = req.files.map(file => 
      uploader.upload(file.buffer, {
        resource_type: 'image',
        folder: 'cooktopia/recipes',
        transformation: [
          { quality: 'auto', format: 'auto' },
          { width: 1200, height: 1200, crop: 'limit' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results.map(result => ({
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }))
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload images'
    });
  }
});

/**
 * DELETE /api/upload/:publicId
 * Delete an image from Cloudinary
 */
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'Public ID is required'
      });
    }

    const result = await uploader.destroy(publicId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete image'
    });
  }
});

/**
 * GET /api/upload/signature
 * Generate a secure upload signature for client-side uploads (alternative approach)
 */
router.get('/signature', async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder: 'cooktopia/recipes',
      transformation: 'q_auto,f_auto,w_1200,h_1200,c_limit'
    };

    // Generate signature using API secret
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: params.folder,
        transformation: params.transformation
      }
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate upload signature'
    });
  }
});

export default router;
