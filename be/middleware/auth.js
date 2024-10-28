// middleware/auth.js
require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

// Middleware to check if the user is authenticated
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    console.log("No token provided");
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Failed to authenticate token:", err.message);
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded;
    console.log("Authenticated user:", req.user);
    next();
  });
};

// Middleware to check if the user is an admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      console.log("Access denied: User is not an admin");
      return res.status(403).json({ message: 'Access denied. Admins only' });
    }
    console.log("Admin access granted");
    next();
  } catch (err) {
    console.log("Error checking admin privileges:", err.message);
    res.status(500).json({ message: 'Error checking admin privileges' });
  }
};

// Function to create a new user (admin only)
const createUser = async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Creating new user:", username);

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password for new user:", hashedPassword);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'user' // Default role to 'user' if not specified
    });

    // Save the user
    await newUser.save();
    console.log("User created successfully");
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.log("Error creating user:", error.message);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

module.exports = { authMiddleware, adminMiddleware, createUser };
