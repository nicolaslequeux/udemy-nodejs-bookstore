const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

// '_' means variable only used internally into this file
let _db;

// I create a method to connect
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://nico-test:nico123test@nodejs-bookstore-qqnku.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("\nCONNECTED_TO_MONGODB\n");
      // I store the connection to my db into _db variable
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// method giving access to the running db => central connection point
const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "Error: no database found";
};

// module.exports = mongoConnect;
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
