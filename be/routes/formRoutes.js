const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User'); // Import the User model to fetch username
const multer = require('multer');
const sharp = require('sharp');
const heicConvert = require('heic-convert');
const path = require('path');
const fs = require('fs');
const { utcToZonedTime, format } = require('date-fns-tz');
const router = express.Router();


const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."));
    }
    cb(null, true);
  },
});

// Middleware to handle HEIC conversion
const handleFileUpload = async (req, res, next) => {
  if (!req.file) return next(); // Skip if no file uploaded

  const tempPath = req.file.path;
  const originalExt = path.extname(req.file.originalname).toLowerCase();
  const targetPath = `uploads/${path.basename(tempPath)}.jpg`; // Save as JPG

  try {
    if (originalExt === '.heic' || req.file.mimetype === 'image/heic') {
      // Convert HEIC to JPEG
      const inputBuffer = fs.readFileSync(tempPath);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG', // Convert to JPEG
        quality: 1,
      });
      fs.writeFileSync(targetPath, outputBuffer);
    } else if (originalExt === '.heif' || req.file.mimetype === 'image/heif') {
      // Convert HEIF to JPEG using sharp
      await sharp(tempPath).toFormat('jpeg').toFile(targetPath);
    } else {
      // If not HEIC/HEIF, copy the file as is
      fs.renameSync(tempPath, targetPath);
    }

    // Update req.file with the new path
    req.file.path = targetPath;
    req.file.mimetype = 'image/jpeg';
    next();
  } catch (error) {
    console.error('Error converting image:', error);
    return res.status(500).json({ message: 'Failed to process image.' });
  }
};

// Convert time to Indonesia Timezone
const toJakartaTime = (utcTime) => {
  try {
    const timeZone = 'Asia/Jakarta';
    const date = new Date(`1970-01-01T${utcTime}`);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid UTC time: ${utcTime}`);
    }
    return utcToZonedTime(date, timeZone);
  } catch (error) {
    console.error('Error converting to Jakarta time:', error.message);
    throw error;
  }
};

// Apply multer middleware to handle file upload
router.post('/submit', authMiddleware, upload.single('photo'), handleFileUpload, async (req, res) => {
  console.log('Body:', req.body); // Log the body data
  console.log('File:', req.file); // Log the file data

  const { customerName, date, location, submissionTime, endTime, description } = req.body;
  const photo = req.file ? req.file.path : null;

  if (!customerName || !date || !photo || !description) {
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

    // Convert submissionTime and endTime to Indonesia timezone and format as HH:mm:ss
    const formattedSubmissionTime = format(toJakartaTime(submissionTime), 'HH:mm:ss');
    const formattedEndTime = endTime
      ? format(toJakartaTime(endTime), 'HH:mm:ss')
      : null;

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

// GET endpoint to fetch all reports or only the user's own reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    let reports;
    if (user.role === 'admin') {
      // Admin: Fetch all reports
      reports = await Report.findAll();
    } else {
      // User: Fetch their own reports
      reports = await Report.findAll({ where: { userId: req.session.userId } });
    }

    // Update the photo path to include the 'uploads' folder
    reports = reports.map((report) => ({
      ...report.toJSON(),
      photo: report.photo ? `/${report.photo}` : null, // Add leading slash
    }));
    
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

module.exports = router;
