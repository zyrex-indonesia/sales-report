const { DataTypes, Model } = require('sequelize');
const sequelize = require('sales-report/config/database.js'); // Adjust the path based on your setup

class Report extends Model {
  static associate(models) {
    Report.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

Report.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'User', key: 'id' },
      onDelete: 'CASCADE', // Delete report if associated user is deleted
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true, // Optional, depending on whether every report must have a username
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
      type: DataTypes.STRING, // Store the path to the photo or BLOB for binary data
      allowNull: true,
    },
    submissionTime: {
      type: DataTypes.TIME, // Store only the time of submission
      allowNull: false,
      defaultValue: DataTypes.NOW, // Automatically sets the current time
    },
    endTime: {
      type: DataTypes.TIME, // Store the end time specified by the user
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize, // Pass the Sequelize instance
    modelName: 'Report',
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = Report;
