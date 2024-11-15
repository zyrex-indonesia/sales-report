const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware to check if the user is authenticated via session
const authMiddleware = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    console.log("User is not authenticated");
    return res.status(403).json({ message: 'Not authenticated. Please log in.' });
  }

  try {
    // Fetch user from the database
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      console.log("User not found");
      return res.status(403).json({ message: 'User not found. Please log in again.' });
    }

    // Set username in session if not already set
    req.session.username = user.username;
    console.log("User authenticated:", req.session.userId, "Username:", req.session.username);

    // Attach the username to req for easier access in other routes
    req.username = user.username;
    next();
  } catch (error) {
    console.log("Error fetching user data:", error.message);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

// Middleware to check if the user is an admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId); // Use the session-stored user ID
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

// Controller function to create a new user (admin only)
const createUser = async (req, res) => {
  const { username, password, role } = req.body;

  // Ensure username and password are provided
  if (!username || !password) {
    console.log("Username and password are required");
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.log("User already exists:", username);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password for new user:", hashedPassword);

    // Create a new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role || 'user' // Default role to 'user' if not specified
    });

    console.log("User created successfully:", newUser.username);
    res.status(201).json({ message: 'User created successfully', user: { username: newUser.username, role: newUser.role } });
  } catch (error) {
    console.log("Error creating user:", error.message);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

module.exports = { authMiddleware, adminMiddleware, createUser };
