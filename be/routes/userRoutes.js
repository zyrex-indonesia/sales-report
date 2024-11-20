const express = require('express'); 
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Sequelize User model
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/check-session', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ success: true, userId: req.session.userId });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

// Endpoint to get all users (requires authentication and admin privileges)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Exclude password field
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Endpoint to get a single user by ID (requires authentication)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Add a new user (requires authentication and admin privileges)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, role, password, firstName, lastName, position, odooBatchId } = req.body;

  if (!username || !role || !password) {
    return res.status(400).json({ success: false, message: 'Username, role, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.log(`User creation failed: Username "${username}" already exists.`);
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    console.log('Raw Password Received:', password);

    // Create the new user
    const newUser = await User.create({
      username,
      role,
      password,
      first_name: firstName || null,
      last_name: lastName || null,
      position: position || null,
      odoo_batch_id: odooBatchId || null,
    });

    console.log('User created successfully:', {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { id: newUser.id, username: newUser.username, role: newUser.role },
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
});

// Endpoint to update a user by ID (requires authentication and admin privileges)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { username, first_name, last_name, position, role, password, confirmPassword } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password fields match
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match!' });
    }

    // Update user fields
    user.username = username || user.username;
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.position = position || user.position;
    user.role = role || user.role;

    // Update the password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Log the updated user object before saving
    console.log('User data before saving:', user);

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});



// Endpoint to delete a user by ID (requires authentication and admin privileges)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
