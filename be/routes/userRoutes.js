const express = require('express');
const User = require('../models/User'); // Sequelize User model
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Endpoint to get all users (requires authentication and admin privileges)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Fetch all users
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add a new user (requires authentication and admin privileges)
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, role, password } = req.body;

  // Ensure all required fields are provided
  if (!username || !role || !password) {
    return res.status(400).json({ success: false, message: 'Username, role, and password are required' });
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Create a new user
    const newUser = await User.create({ username, role, password });

    res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
});

module.exports = router;
