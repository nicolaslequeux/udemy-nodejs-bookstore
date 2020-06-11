// I import a constructor function (class), thus capital letter
//const Sequelize = require("sequelize");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "udemy-nodejs-bookstore",
  "root",
  "my-nlxt-sql",
  {
    dialect: "mysql",
    host: "localhost",
  }
);

module.exports = sequelize;
