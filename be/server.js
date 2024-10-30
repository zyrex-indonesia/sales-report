require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Sequelize = require('sequelize');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express();
app.use(express.json());

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true, // Allow credentials (session cookies)
}));

// Set up session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` if using HTTPS
  })
);

// Rest of your code remains the same
const PORT = process.env.PORT || 5000;

// Initialize Sequelize and connect to MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
  }
);

// Test the database connection
sequelize.authenticate()
  .then(() => console.log("Connected to MySQL"))
  .catch(err => console.error("MySQL connection error:", err));

// Middleware to check if the user is authenticated via session
const authMiddleware = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).json({ message: 'Not authenticated. Please log in.' });
  }
  next();
};

// Middleware to check if the user is an admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId); // Find user by session userId
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error checking admin privileges' });
  }
};

// User routes (protected with authMiddleware and adminMiddleware where necessary)
app.use('/api', userRoutes);

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt with:", username, password);

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid username or password' });

    req.session.userId = user.id;
    res.json({ success: true, message: 'Logged in successfully' });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Error logging in' });
  }
});


// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Function to create initial admin user
const createInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const plaintextPassword = 'password'; // Set your desired password here
      const hashedPassword = await bcrypt.hash(plaintextPassword, 10);

      const admin = await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Initial admin user created with username: "admin"');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
};

// Sync Sequelize models and create initial admin
sequelize.sync().then(async () => {
  await createInitialAdmin();
  console.log('Initial admin user checked/created.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
