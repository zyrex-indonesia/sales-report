'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Reports');

    // Check if the `userId` column already exists
    if (!tableInfo.userId) {
      await queryInterface.addColumn('Reports', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Reports');

    // Check if the `userId` column exists before trying to remove it
    if (tableInfo.userId) {
      await queryInterface.removeColumn('Reports', 'userId');
    }
  },
};
