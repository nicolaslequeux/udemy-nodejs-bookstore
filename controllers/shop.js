const fs = require("fs");
const path = require("path");

// I name it PDFDocument as pdfkit exposes a PDFDocument constructor
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = require("../util/nico");

exports.getIndex = (req, res, next) => {
  // if query undefined then I assign 1 otherwise bug into views as value does not exit
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      // 'Product' is a Mongoose model and Mongose provides a 'find()' method, no need to create this method in the model!
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      //console.log(err);
      // res.redirect("/500");
      // J'ecrase le message interne pas un nouveau
      // const error = new Error("err");
      // Je passe le message interne (plus explicite pour debugguer)
      const error = err
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

// // VERSION 1 : I GENERATE A FILE THAT ALREADY EXIST
// exports.getInvoice = (req, res, next) => {
//   // 'orderId' is specified as params into the route
//   const orderId = req.params.orderId;
//   const invoiceName = "invoice-" + orderId + ".pdf";
//   // Only auth user can acess the invoices (order routes), but I still have to make sure user can only see its own invoices
//   Order.findById(orderId).then(order => {
//     if (!order) {
//       return next(new Error('No order found'));
//     }
//     // Is user from order db equal to logged in user?
//     if (order.user.userId.toString() !== req.user._id.toString()) {
//       return next(new Error('Unauthorized'));
//     }
//     const invoicePath = path.join("data", "invoices", invoiceName);
//     // fs.readFile(invoicePath, (err, data) => {
//     //   if (err) {
//     //     // if error, I 'next' it, thus the default error handling can take over
//     //     return next(err);
//     //   }
//     //   res.setHeader('Content-Type', 'application/pdf');
//     //   // res.setHeader('Content-Disposition', 'attachement; filename="' + invoiceName + '"');
//     //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
//     //   res.send(data);
//     // });
//     // version Stream files (recommanded way as can manage big data files)
//     const file = fs.createReadStream(invoicePath);
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
//     file.pipe(res);
//   }).catch(err => next(err));
// };

// VERSION 2 : I GENERATE A PDF FILE ON THE FLY
exports.getInvoice = (req, res, next) => {
  // 'orderId' is specified as params into the route
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      // Is user from order db equal to logged in user?
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.fontSize(13).text("----------------------------------------");

      let totalPrice = 0;

      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.text(
          prod.product.title +
            " - " +
            prod.quantity +
            " x $" +
            prod.product.price
        );
      });

      pdfDoc.text("Total Price: $" + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
