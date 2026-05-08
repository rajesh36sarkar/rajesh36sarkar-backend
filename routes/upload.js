const express = require('express');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Single image upload (for profile, project thumbnail, etc.)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'portfolio' });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Multiple images upload (for project gallery)
router.post('/multiple', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const uploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path, { folder: 'portfolio/gallery' })
    );
    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.secure_url);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;