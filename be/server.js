require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware to verify JWT token and set req.user
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token' });

    req.user = decoded;
    next();
  });
};

// Middleware to check if the user is an admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error checking admin privileges' });
  }
};

// Register a new user (admin only)
app.post('/register', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:");
  console.log("Username:", username);
  console.log("Entered password:", password);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    console.log("Stored hashed password for user:", user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

const createInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const plaintextPassword = 'password';  // use the same password here and in the login attempt
      console.log("Plaintext password for admin:", plaintextPassword);

      const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
      console.log("Hashed password for admin:", hashedPassword);

      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Initial admin user created with username: "admin"');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
};


mongoose.connection.once('open', async () => {
  await createInitialAdmin();
  console.log("Initial admin user checked/created.");
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});

