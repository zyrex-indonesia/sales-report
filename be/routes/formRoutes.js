const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Report = require('../models/Report');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Apply multer middleware to handle file upload
router.post('/submit', upload.single('photo'), async (req, res) => {
  console.log('Body:', req.body);  // Log the body data
  console.log('File:', req.file);  // Log the file data
  
  const { customerName, date, location, submissionTime, endTime } = req.body;
  const photo = req.file ? req.file.path : null;

  if (!customerName || !date || !photo) {
    console.error("Missing required fields");
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    // Convert submissionTime and endTime to a 24-hour format (HH:MM:SS)
    const formattedSubmissionTime = new Date(`1970-01-01T${submissionTime}`).toISOString().split('T')[1].split('.')[0];
    const formattedEndTime = endTime ? new Date(`1970-01-01T${endTime}`).toISOString().split('T')[1].split('.')[0] : null;

    // Create a new report
    const report = await Report.create({
      userId: req.session.userId,
      location,
      name: customerName,
      photo,
      submissionTime: formattedSubmissionTime,
      endTime: formattedEndTime,
    });
    
    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Error creating report', error: error.message });
  }
});

module.exports = router;
