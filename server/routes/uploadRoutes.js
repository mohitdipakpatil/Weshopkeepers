const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/image', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

router.post('/images', protect, admin, upload.array('images', 6), (req, res) => {
  if (!req.files || req.files.length === 0) { res.status(400); throw new Error('No files uploaded'); }
  const images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  res.json({ success: true, images });
});

module.exports = router;
