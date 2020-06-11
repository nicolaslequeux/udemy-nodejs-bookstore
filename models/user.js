// Require the 'Sequelize' constructor (class)
const { Sequelize } = require("sequelize");

// import our own sequelize object which hold our connection parameters
const sequelize = require("../util/database");

// My 'User' model is not a class anymore, it is a sequelize instance
// The 'User' model is singular, but sequelize will create a table pluralized as : 'produtcs'
const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  // name: {
  //   type: Sequelize.STRING,
  //   allowNull: false,
  // },
  // email: {
  //   type: Sequelize.STRING,
  //   allowNull: false,
  //   unique: true,
  //   validate: {
  //     isEmail: true,
  //   },
  // },
});

module.exports = User;
