const User = require('../models/User');

// Middleware to check if the user is authenticated based on credentials
const authMiddleware = async (req, res, next) => {
  try {
    const { username, password } = req.headers; // Extract credentials from headers

    if (!username || !password) {
      console.log('Authentication failed: Missing username or password');
      return res.status(403).json({ message: 'Not authenticated. Please provide username and password.' });
    }

    // Fetch the user from the database using the provided username
    const user = await User.findOne({ where: { username } });

    if (!user || user.password !== password) {
      console.log('Authentication failed: Invalid credentials');
      return res.status(403).json({ message: 'Invalid username or password. Please try again.' });
    }

    console.log('User authenticated:', user.username);

    // Attach user data to the request object for use in other routes
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    console.log('Error during authentication:', error.message);
    res.status(500).json({ message: 'Error during authentication', error: error.message });
  }
};

// Middleware to check if the user is an admin
const adminMiddleware = async (req, res, next) => {
  try {
    const { username, password } = req.headers; // Extract credentials from headers

    if (!username || !password) {
      console.log('Access denied: Missing username or password');
      return res.status(403).json({ message: 'Access denied. Please provide username and password.' });
    }

    // Fetch the user from the database using the provided username
    const user = await User.findOne({ where: { username } });

    if (!user || user.password !== password || user.role !== 'admin') {
      console.log('Access denied: User is not an admin');
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    console.log('Admin access granted:', user.username);

    // Attach user data to the request object for use in other routes
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    console.log('Error during admin privilege check:', error.message);
    res.status(500).json({ message: 'Error checking admin privileges', error: error.message });
  }
};

// Controller function to create a new user (admin only)
const createUser = async (req, res) => {
  const { username, password, role, first_name, last_name, position, odoo_batch_id } = req.body;

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

    // Create a new user with all fields
    const newUser = await User.create({
      username,
      password,
      role: role || 'user', // Default role to 'user' if not specified
      first_name: first_name || null, // Include first_name if provided, else set to null
      last_name: last_name || null,  // Include last_name if provided, else set to null
      position: position || null,    // Include position if provided, else set to null
      odoo_batch_id: odoo_batch_id || null, // Include odoo_batch_id if provided, else set to null
    });

    console.log("User created successfully:", newUser.username);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        username: newUser.username,
        role: newUser.role,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        position: newUser.position,
        odoo_batch_id: newUser.odoo_batch_id,
      },
    });
  } catch (error) {
    console.log("Error creating user:", error.message);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

module.exports = { authMiddleware, adminMiddleware, createUser };
