import express from 'express';
import parser from '../middleware/upload.js';  //originally multer.config.js

const router = express.Router();

// router.post('/upload', parser.single('media'), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//   res.json({ url: req.file.path });
// });
router.post('/upload', parser.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      url: req.file.path, // Cloudinary hosted URL
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
