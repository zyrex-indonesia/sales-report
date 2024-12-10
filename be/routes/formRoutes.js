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
const { Op } = require('sequelize');
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
      const inputBuffer = fs.readFileSync(tempPath);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1,
      });
      fs.writeFileSync(targetPath, outputBuffer);
    } else if (originalExt === '.heif' || req.file.mimetype === 'image/heif') {
      await sharp(tempPath).toFormat('jpeg').toFile(targetPath);
    } else {
      fs.renameSync(tempPath, targetPath);
    }

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

    // Create a Date object from the UTC time string
    const utcDate = new Date(`1970-01-01T${utcTime}Z`);

    if (isNaN(utcDate.getTime())) {
      throw new Error(`Invalid UTC time: ${utcTime}`);
    }

    // Convert the UTC time to Jakarta timezone
    const jakartaTime = utcToZonedTime(utcDate, timeZone);

    // Format the Jakarta time to HH:mm:ss
    return format(jakartaTime, 'HH:mm:ss', { timeZone });
  } catch (error) {
    console.error('Error converting to Jakarta time:', error.message);
    return null;
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
    const { id: userId, username } = req.user; // Use `req.user` set by authMiddleware

    const formattedSubmissionTime = format(toJakartaTime(submissionTime), 'HH:mm:ss');
    const formattedEndTime = endTime
      ? format(toJakartaTime(endTime), 'HH:mm:ss')
      : null;

    const report = await Report.create({
      userId,
      username,
      location,
      name: customerName,
      photo,
      submissionTime: formattedSubmissionTime,
      endTime: formattedEndTime,
      description,
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
    const { id: userId, role } = req.user;

    if (!userId || !role) {
      console.error('User not authenticated or role missing in req.user');
      return res.status(403).json({ message: 'Authentication required.' });
    }

    let reports;
    if (role === 'admin') {
      console.log('Fetching all reports for admin.');
      reports = await Report.findAll();
    } else {
      console.log(`Fetching reports for userId: ${userId}`);
      reports = await Report.findAll({ where: { userId } });
    }

    if (!reports || reports.length === 0) {
      console.log('No reports found.');
      return res.status(404).json({ message: 'No reports found.' });
    }

    // Update photo paths
    reports = reports.map((report) => ({
      ...report.toJSON(),
      photo: report.photo ? `/${report.photo}` : null,
    }));

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ message: 'Error fetching reports.', error: error.message });
  }
});

// GET endpoint to fetch daily reports
router.get('/daily', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const jakartaNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

    const todayStart = new Date(jakartaNow.setHours(0, 0, 0, 0));
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayStart.getDate() + 1);

    console.log('Fetching daily reports. Date Range:', todayStart, todayEnd);

    const reports = await Report.findAll({
      where: {
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: todayEnd,
        },
      },
    });

    if (!reports || reports.length === 0) {
      console.log('No daily reports found.');
      return res.status(404).json({ message: 'No daily reports found.' });
    }

    reports.forEach((report) => {
      if (report.photo && !report.photo.startsWith('uploads/')) {
        report.photo = `uploads/${report.photo}`;
      }
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching daily reports:', error.message);
    res.status(500).json({ message: 'Error fetching daily reports.', error: error.message });
  }
});


module.exports = router;
