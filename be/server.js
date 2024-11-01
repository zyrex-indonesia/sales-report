// server.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Sequelize = require('sequelize');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express();
app.use(express.json());

const sessionStore = new MySQLStore({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Zyr3xuser',
  database: 'sales_report_db',
});

// CORS setup with debugging
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend origin
  credentials: true // Allow credentials to be sent
}));

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

sequelize.authenticate()
  .then(() => console.log("Connected to MySQL"))
  .catch(err => console.error("MySQL connection error:", err));

// Session setup with additional logging
app.use(session({
  secret: '5a14c3f643c00c77b49288c1cf7b9c5c67be39266afa5922da09b2bfe28aa149940b81b05e3892a71d6fffe95015965ea56cac0cd82a673386d4d390e391e2f6',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax', // Lax mode to allow cookies with same-site requests
  },
}));

// Check-session route
app.get('/api/users/check-session', (req, res) => {
  console.log('Session in check-session:', req.session); // Check if userId persists
  if (req.session.userId) {
    res.json({ message: 'Session active' });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});



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
    const user = await User.findByPk(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error checking admin privileges' });
  }
};

// Use the imported user routes for all user-related requests
app.use('/api/users', userRoutes);

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Set the session with the user's ID
    req.session.userId = user.id;
    console.log("Session after login:", req.session); // Log session data for debugging
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
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

      await User.create({
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
