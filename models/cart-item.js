// Require the 'Sequelize' constructor (class)
const { Sequelize } = require("sequelize");

// import our own sequelize object which hold our connection parameters
const sequelize = require("../util/database");

const CartItem = sequelize.define("cartItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: Sequelize.INTEGER,
});

module.exports = CartItem;
