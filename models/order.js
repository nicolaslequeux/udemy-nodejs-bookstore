// Require the 'Sequelize' constructor (class)
const { Sequelize } = require("sequelize");

// import our own sequelize object which hold our connection parameters
const sequelize = require("../util/database");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Order;
