require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Add CORS middleware
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const Sequelize = require('sequelize');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const formRoutes = require('./routes/formRoutes');
const Report = require('./models/Report'); // Import the Report model
const fs = require('fs');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const { utcToZonedTime, format } = require('date-fns-tz');
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ['http://sales.zyrex.com', 'https://sales.zyrex.com'], // Allow both http and https
    credentials: true,
  })
);

app.options('*', cors());

const sessionStore = new MySQLStore({
  host: '172.17.0.2',
  port: 3306,
  user: 'root',
  password: 'Zyr3xuser',
  database: 'sales_report_db',
});

const PORT = process.env.PORT || 5000;

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: '172.17.0.2',  // Update with your database host
  user: 'root',       // Update with your MySQL username
  password: 'Zyr3xuser', // Update with your MySQL password
  database: 'sales_report_db', // Update with your MySQL database name
  timezone: 'Asia/Jakarta' // Ensures all times are handled in WIB
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
    host: process.env.DB_HOST || '172.17.0.2',
    dialect: 'mysql',
    timezone: '+07:00', // Set Jakarta timezone
  }
);

sequelize.authenticate()
  .then(() => console.log("Connected to MySQL"))
  .catch(err => console.error("MySQL connection error:", err));

// Session setup with additional logging
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // Set to true in production with HTTPS
    sameSite: 'none', // Prevent CSRF
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

    if (!req.user || !req.user.id || !req.user.username) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!customerName || !date || !location || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Timezone conversion to Jakarta time (Asia/Jakarta)
    const timeZone = 'Asia/Jakarta';

    const jakartaSubmissionTime = submissionTime
      ? format(utcToZonedTime(new Date(`${date}T${submissionTime}`), timeZone), 'HH:mm:ss', { timeZone })
      : null;

    const jakartaEndTime = endTime
      ? format(utcToZonedTime(new Date(`${date}T${endTime}`), timeZone), 'HH:mm:ss', { timeZone })
      : null;

    // Create a new report entry in the database
    const report = await Report.create({
      userId: req.user.id, // Use user id from req.user
      username: req.user.username, // Use username from req.user
      name: customerName,
      date,
      location,
      submissionTime: jakartaSubmissionTime,
      endTime: jakartaEndTime,
      photo,
      description,
    });

    res.status(200).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Error submitting report', error: error.message });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fetch user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare raw passwords (no hashing)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Save session data
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
