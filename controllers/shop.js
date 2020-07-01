const Product = require("../models/product");
const Order = require("../models/order");

exports.getIndex = (req, res, next) => {
  // 'Product' is a Mongoose model and Mongose provides a 'find()' method, no need to create this method in the model!
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        // isAuthenticated: req.session.isLoggedIn,
        // // 'csrfToken' method is provided by the csrf midlleware we added
        // csrfToken: req.csrfToken(),
      });
    })
    // .catch((err) => {
    //   console.log(err);
    // });
    .catch((err) => {
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    // .catch((err) => {
    //   console.log(err);
    // });
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // the findById of Mongoose also convert mongoDB '_id' to ObjectID  for us !
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Shop - " + product.title,
        path: "/products",
      });
    })
    // .catch((err) => {
    //   console.log(err);
    // });
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
      });
    })
    // .catch((err) => console.log(err));
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    // .catch((err) => console.log(err));
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        // '._doc' method provided by mongoose
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user, // mongoose will pick the id from the entire user object
        },
        products: products,
      });
      order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
    })
    // .catch((err) => console.log(err));
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};
