// get the client
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "udemy-nodejs-bookstore",
  password: "my-nlxt-sql",
});

module.exports = pool.promise(); // promises are easier to manipulate compare to callbacks
