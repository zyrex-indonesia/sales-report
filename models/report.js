const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path based on your setup
const User = require('./User'); // Ensure the path is correct

class Report extends Model {}

Report.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE', // Delete report if associated user is deleted
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING, // Or use BLOB if you want to store binary data
      allowNull: true,
    },
  },
  {
    sequelize, // Pass the Sequelize instance
    modelName: 'Report',
    timestamps: true, // Add timestamps for createdAt and updatedAt fields
  }
);

module.exports = Report;
