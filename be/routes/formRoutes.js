const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const Report = require('../models/Report');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists or create it
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post('/submit', authMiddleware, upload.single('photo'), async (req, res) => {
  const { customerName, date, location, submissionTime, endTime } = req.body;
  const photo = req.file ? req.file.path : null;

  // Validate required fields
  if (!customerName || !date || !photo) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    const report = await Report.create({
      userId: req.session.userId,
      location,
      name: customerName,
      photo,
      submissionTime,
      endTime,
    });
    res.status(201).json({ success: true, message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Error creating report', error: error.message });
  }
});

module.exports = router;
