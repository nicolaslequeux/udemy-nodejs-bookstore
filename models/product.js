// const Sequelize = require("sequelize");
const { Sequelize } = require("sequelize");

const sequelize = require("../util/database");

// My 'Product' model is not a class anymore, it is a sequelize instance
// The 'Product' model is singular, but sequelize will create a table pluralized as : 'produtcs'
const Product = sequelize.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING, // shortcut to define a type only
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Product;
