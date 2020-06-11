// Require the 'Sequelize' constructor (class)
const { Sequelize } = require("sequelize");

// import our own sequelize object which hold our connection parameters
const sequelize = require("../util/database");

const Cart = sequelize.define("cart", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Cart;

// BEFORE USING SEQUELIZE
// const fs = require("fs"); // to write on the file system
// const path = require("path"); // to construct paths that's work on all OS

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   "data",
//   "cart.json"
// );

// module.exports = class Cart {

//   static getCart(cb) {
//     fs.readFile(p, (err, fileContent) => {
//       const cart = JSON.parse(fileContent);
//       if (err) {
//         return cb(null);
//       }
//       cb(cart);
//     })
//   }

//   static addProduct(id, productPrice) {
//     // fetch previous cart
//     fs.readFile(p, (err, fileContent) => {
//       let cart = { products: [], totalPrice: 0 };
//       if (!err) {
//         cart = JSON.parse(fileContent);
//       }

//       // find existing product?
//       const existingProductIndex = cart.products.findIndex(
//         (prod) => prod.id === id
//       );
//       const existingProduct = cart.products[existingProductIndex];
//       let updatedProduct;

//       // add new product or change quantity
//       if (existingProduct) {
//         updatedProduct = { ...existingProduct }; // I distribute all property of existing product
//         updatedProduct.qty = updatedProduct.qty + 1;
//         cart.products = [...cart.products]; // copying the all array
//         cart.products[existingProductIndex] = updatedProduct; // override exisiting product (new qty)
//       } else {
//         updatedProduct = { id: id, qty: 1 };
//         // I add the new product to the array of products
//         cart.products = [...cart.products, updatedProduct];
//       }

//       cart.totalPrice = cart.totalPrice + +productPrice;

//       fs.writeFile(p, JSON.stringify(cart), (err) => {
//         console.log(err);
//       });
//     });
//   }

//   static deleteProduct(id, productPrice) {
//     fs.readFile(p, (err, fileContent) => {
//       if (err) {
//         return;
//       }
//       const cart = JSON.parse(fileContent);
//       const updatedCart = { ...cart };
//       const product = updatedCart.products.find((prod) => prod.id === id);
//       if (!product) {
//         return;
//       }
//       const productQty = product.qty;
//       updatedCart.products = updatedCart.products.filter(
//         (prod) => prod.id !== id
//       );
//       updatedCart.totalPrice =
//         updatedCart.totalPrice - productPrice * productQty;
//       fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
//         console.log(err);
//       });
//     });
//   }
// };
