// I need mongoDB to get access to the object id type
const mongodb = require("mongodb");

// const getDb =require('../util/database').getDb;
const { getDb } = require("../util/database");

class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    // bug: if 'id' argument undefind, 'new mongodb.ObjectID(id)' will not be undefined!
    // last argument = optional
    this._id = id ? new mongodb.ObjectID(id) : null;
  }

  // Same method to create and and update here
  save() {
    // database connection
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection("products")
        // $set is a mongodb method to update, I can pass this and the _id will not be overwritten
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    // find() do not return a promise but a 'cursor' : object from mongoDB... as collection could have millions onf documents!
    // .toArray method pull all documents into an array vs pagination access
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log("\n---- PRODUCTS FETCHALL\n", products);
        return products;
      })
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();
    return (
      db
        .collection("products")
        // new mongodb.ObjectID constructor to compare _id string with mondodb object id!
        .find({ _id: new mongodb.ObjectID(prodId) })
        .next()
        .then((product) => {
          console.log("\n---- PRODUCTS FINDBYID\n", product);
          return product;
        })
        .catch((err) => console.log(err))
    );
  }

  // delete : I could use a class methode to call delete on the product I have called or use a static method which takes and id argument
  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectID(prodId) })
      .then(() => {
        console.log("\n---- PRODUCT DELETED\n");
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
