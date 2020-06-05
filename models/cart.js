const fs = require("fs"); // to write on the file system
const path = require("path"); // to construct paths that's work on all OS

const p = path.join(path.dirname(process.mainModule.filename), "data", "cart.json");

module.exports = class Cart {

  static addProduct(id, productPrice) {

    // fetch previous cart
    fs.readFile(p, (err, fileContent) => {

      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      
      // find existing product?
      const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
  
      // add new product or change quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct }; // I distribute all property of existing product
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products]; // copying the all array
        cart.products[existingProductIndex] = updatedProduct; // override exisiting product (new qty)
      } else {
        updatedProduct = { id: id, qty: 1 };
        // I add the new product to the array of products
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;

      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });

    });
  }
  
};
