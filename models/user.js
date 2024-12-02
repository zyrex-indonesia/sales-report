const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../be/config/database'); // Adjust the path based on your setup

// Define the User model
class User extends Model {
  // Method to compare password during login
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3], // Enforce minimum length if needed
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6], // Ensure password is of valid length
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'), // Define possible roles
      defaultValue: 'user',
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    odoo_batch_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize, // Pass the Sequelize instance
    modelName: 'User',
    timestamps: true, // Add timestamps for createdAt and updatedAt fields
    hooks: {
      // Hash the password before saving if it was modified
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;
