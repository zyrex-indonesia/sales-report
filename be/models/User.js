const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema with role-based access
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // Ensure unique usernames
    minlength: 3,  // Enforce minimum length if needed
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Ensure password is of valid length
  },
  role: {
    type: String,
    enum: ['admin', 'user'],  // Define possible roles
    default: 'user',  // Default role as 'user'
  },
}, { timestamps: true });  // Add timestamps for createdAt and updatedAt fields

// Hash the password before saving the user to the database
userSchema.pre('save', async function (next) {
  // If the password hasn't been modified, skip hashing
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// Method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
