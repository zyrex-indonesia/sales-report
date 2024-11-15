const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User'); // Import the User model to fetch username
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Apply multer middleware to handle file upload
router.post('/submit', authMiddleware, upload.single('photo'), async (req, res) => {
  console.log('Body:', req.body);  // Log the body data
  console.log('File:', req.file);  // Log the file data

  const { customerName, date, location, submissionTime, endTime, description } = req.body;
  const photo = req.file ? req.file.path : null;

  if (!customerName || !date || !photo || !description) { // Make description required
    console.error("Missing required fields");
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    // Fetch the username from the Users table using the userId from the session
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use the username from the fetched user
    const username = user.username;

    // Convert submissionTime and endTime to a 24-hour format (HH:MM:SS)
    const formattedSubmissionTime = new Date(`1970-01-01T${submissionTime}`).toISOString().split('T')[1].split('.')[0];
    const formattedEndTime = endTime ? new Date(`1970-01-01T${endTime}`).toISOString().split('T')[1].split('.')[0] : null;

    // Create a new report
    const report = await Report.create({
      userId: req.session.userId,
      username, // Use the fetched username here
      location,
      name: customerName,
      photo,
      submissionTime: formattedSubmissionTime,
      endTime: formattedEndTime,
      description // Add the description field to the database entry
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Error creating report', error: error.message });
  }
});

// GET endpoint to fetch all reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch the user to check their role
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let reports;
    if (user.role === 'admin') {
      // If the user is an admin, fetch all reports
      reports = await Report.findAll({
        include: [{
          model: User,
          as: 'user', // Use the alias defined in the association
          attributes: ['username']
        }],
        attributes: ['id', 'userId', 'username', 'location', 'name', 'photo', 'submissionTime', 'endTime', 'description', 'createdAt']
      });
    } else {
      // If the user is not an admin, fetch only their own reports
      reports = await Report.findAll({
        where: { userId: req.session.userId },
        include: [{
          model: User,
          as: 'user', // Use the alias defined in the association
          attributes: ['username']
        }],
        attributes: ['id', 'userId', 'username', 'location', 'name', 'photo', 'submissionTime', 'endTime', 'description', 'createdAt']
      });
    }

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});


module.exports = router;
