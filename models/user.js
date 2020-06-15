// I need mongoDB to get access to the object id type
const mongodb = require("mongodb");

// const getDb =require('../util/database').getDb;
const { getDb } = require("../util/database");

// I create a reference, I do not call the function
const ObjectId = mongodb.ObjectID;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // { items: [] };
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  // There is a card per client (one-ton-one relation), so with mongodb, no need to create a cart model and db, we can embed the cart on the user model!
  addToCart(product) {

    const updatedCart = {
      items: [{ productId: new ObjectId(product._id), quantity: 1 }],
    };
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      // '$set' receives an object which holds fields to update
      { $set: { cart: updatedCart } }
    );
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
