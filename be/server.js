// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Sequelize = require('sequelize');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const formRoutes = require('./routes/formRoutes');
const Report = require('./models/Report'); // Import the Report model
const fs = require('fs');
const mysql = require('mysql2');

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

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',  // Update with your database host
  user: 'root',       // Update with your MySQL username
  password: 'Zyr3xuser', // Update with your MySQL password
  database: 'sales_report_db' // Update with your MySQL database name
});

function initializeDatabase() {
  fs.readFile('setup.sql', 'utf-8', (err, sql) => {
    if (err) {
      console.error('Error reading SQL file:', err);
      return;
    }

    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error executing SQL file:', error);
        return;
      }
      console.log('Database setup complete.');
    });
  });
}

// Check if tables already exist, then initialize if needed
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL.');

  // Check if the "users" table exists
  connection.query("SHOW TABLES LIKE 'users'", (err, result) => {
    if (err) throw err;

    // If "users" table doesn't exist, run the SQL setup file
    if (result.length === 0) {
      console.log("Initializing database...");
      initializeDatabase();
    } else {
      console.log("Database is already initialized.");
    }
  });
})

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
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax', // Prevent CSRF
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Check-session route
app.get('/api/users/check-session', (req, res) => {
  if (req.session && req.session.userId && req.session.role) {
    console.log('Session is active:', req.session.role); // Debug session data
    return res.json({
      message: 'Session active',
      userId: req.session.userId,
      role: req.session.role,
    });
  } else {
    console.log('No active session found');
    return res.status(401).json({ message: 'No active session' });
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

// Use the imported form routes for all report-related requests
app.use('/api/reports', formRoutes); // Mounts formRoutes under /api/reports

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/reports/submit', async (req, res) => {
  try {
    console.log('Body:', req.body);
    console.log('File:', req.file);
    const { customerName, date, location, submissionTime, endTime, description } = req.body;

    // Assuming `photo` is being uploaded as binary or file data
    const photo = req.file ? req.file.path : null;

    // Create a new report entry in the database
    const report = await Report.create({
      userId: req.session.userId,  // Assuming user is authenticated and session contains userId
      username: req.session.username,
      name: customerName,
      date,
      location,
      submissionTime,
      endTime,
      photo,
      description,
    });

    res.status(200).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Error submitting report' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fetch user by username
    const user = await User.findOne({ where: { username } });
    console.log('User found:', user);

    // If user does not exist
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Comparison:', { entered: password, stored: user.password, result: isMatch });

    // If passwords do not match
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Success - Set session and respond
    req.session.userId = user.id;
    req.session.role = user.role;
    return res.json({ message: 'Logged in successfully', role: user.role });

  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    return res.json({ message: 'Logged out successfully' });
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
