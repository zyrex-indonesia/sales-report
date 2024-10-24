const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');

const User = require('./models/User');
const Report = require('./models/Report');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

// User registration (Admin Only)
app.post('/register', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();
  res.status(201).json({ message: 'User created' });
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, 'secret_key');
  res.json({ token });
});

// Submit a report (Salespersons/Admin)
app.post('/reports', authMiddleware, upload.single('photo'), async (req, res) => {
  const { location, name } = req.body;
  const photo = req.file ? req.file.filename : null;
  const report = new Report({ user: req.user.id, location, name, photo });
  await report.save();
  res.status(201).json({ message: 'Report submitted' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
