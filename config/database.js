const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,      // Database name from .env
  process.env.DB_USER,      // Database user from .env
  process.env.DB_PASSWORD,  // Database password from .env
  {
    host: process.env.DB_HOST || 'db',
    dialect: 'mysql',
  }
);

module.exports = sequelize;
