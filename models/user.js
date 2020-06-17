// I need mongoDB to get access to the object id type
const mongodb = require("mongodb");

// const getDb =require('../util/database').getDb;
const { getDb } = require("../util/database");
const { getCart } = require("../controllers/shop");

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
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      // solution #1 : return cp.productId == product._id;
      return cp.productId.toString() === product._id.toString(); // mongodb id is not a proper string
    });
    let newQuantity = 1;

    // create a new array with all elements in the cart
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      // if index does not exists, returns -1
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      // '$set' receives an object which holds fields to update
      { $set: { cart: updatedCart } }
    );
  }

  getCart() {
    const db = getDb();
    // I construct an array of id to use it in the mongodb query
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      })
      .catch((err) => console.log(err));
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new ObjectId(this._id) })
      .toArray();
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
