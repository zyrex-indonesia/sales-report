const express = require('express');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth'); // Consolidated middleware import

const router = express.Router();

// Endpoint to get all users (requires authentication and admin privileges)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find();
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
    return res.status(400).json({ message: 'Username, role, and password are required' });
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user
    const newUser = new User({ username, role, password });

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

module.exports = router;
