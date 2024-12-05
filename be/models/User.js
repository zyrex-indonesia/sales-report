const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path based on your setup

// Define the User model
class User extends Model {
  // Method to compare password during login (no hashing)
  matchPassword(enteredPassword) {
    return enteredPassword === this.password; // Direct comparison
  }

  // Define associations in a static method
  static associate(models) {
    // Define association with the Report model
    User.hasMany(models.Report, { foreignKey: 'userId', as: 'reports' });
  }
}

// Initialize the User model
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
  }
);

module.exports = User;
