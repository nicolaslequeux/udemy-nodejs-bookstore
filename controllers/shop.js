// I require the class object with capital letter
const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  
  // EXEMPLE EN RAPPEL :
  // console.log(Product.findById(prodId, (product) => { }))
  // IMPOSSIBLE DE FAIRE UN CONSOLE.LOG COMME CECI CAR PRODUCT.FINDBYID EST UNE ASYNCH FUNCTION
  // DONC JE DOIS UTILISER UN CALLBACK POUR TRAITER LE RESULTAT
  
  // I pass the id, I will 'eventually!' receive a product object back
  Product.findById(prodId, (product) => {
    // console.log(product);
    res.render("shop/product-detail", {
      product: product,
      pageTitle: "Shop - " + product.title,
      path: "/products", // Je choisis le path que je veux higlighted...
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  });
};

exports.getCart = (req, res, next) => {
  res.render("shop/cart", {
    pageTitle: "Your Cart",
    path: "/cart",
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => { // fetch product from data base
    Cart.addProduct(prodId, product.price); // add it to the cart
  });
  res.redirect("/cart");
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};
