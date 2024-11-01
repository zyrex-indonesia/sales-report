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
  const { username, role, password } = req.body;

  if (!username || !role || !password) {
    return res.status(400).json({ success: false, message: 'Username, role, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, role, password: hashedPassword });

    res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
});

// Endpoint to update a user by ID (requires authentication and admin privileges)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, first_name, last_name, position, role, password, odoo_batch_id } = req.body;

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided
    if (username) user.username = username;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (position) user.position = position;
    if (role) user.role = role;
    if (odoo_batch_id) user.odoo_batch_id = odoo_batch_id;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    console.error("Error updating user:", error.message);
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
