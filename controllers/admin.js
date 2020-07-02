// validationResult collects all results from validation error on the route
const { validationResult } = require("express-validator");

const Product = require("../models/product");
const product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id }) // filter to find only products created by the user
    // mongoose method to select/exclude field
    // .select('title price -_id')
    // mongoose method to populate from referenced object/related fields (here user model)
    // .populate('userId', 'name')
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddProduct = (req, res, next) => {
  // Methode basic pour protéger une route.... but cumbersome!
  // if (!req.session.isLoggedIn) {
  //   return res.redirect("/login");
  // }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
    });
  }

  // on the image object (from multer middleware) I can access the path and then store that path into the database, then file can stay on the file system of the server
  const imageUrl = image.path;

  const errors = validationResult(req); // I collect my errors
  
  if (!errors.isEmpty()) {
    // I use 'return' thus following code will not execute
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      // I just show the first [0] that I ma guarantee to have... (at least)
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    // v1 : userId: req.user._id
    // v2 : Mongoose retrives automaticaly the id for the object
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // SOLUTION 1 : FOR ERROR HANDLING... DATABASE TEMPORY ISSUE HERE
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   // I just show the first [0] that I ma guarantee to have... (at least)
      //   errorMessage: "Database operation failed, please try again.",
      //   validationErrors: [], // in this case I dont want to put a red border around anything
      // });

      // SOLUTION 2 : REDIRECT ON AN ERROR HANDLING PAGE
      // res.redirect("/500");

      // SOLUTION 3 : I pass an error object to a central error managing middleware
      const error = new Error("Creating a product failed!");
      error.httpStatusCode = 500;
      // with error passed in next(), Express skips other middlewares and goes to the error middleware
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (editMode != "true") {
    res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      // throw new Error('Dummy error') // Example of error to test error middleware
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

// postEditProduct is a new 'action' which receive (req, res) objects and (next) function
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  // const updatedImageUrl = req.body.imageUrl;
  const image = req.file;
  const errors = validationResult(req); // I collect my errors
  if (!errors.isEmpty()) {
    // I use 'return' thus following code will not execute
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        // imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      // I just show the first [0] that I ma guarantee to have... (at least)
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      // qlq essaie de forcer une url sans l'accès
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      // product.imageUrl = updatedImageUrl;
      if (image) {
        product.imageUrl = image.path;
      }
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT");
        res.redirect("/admin/products"); // redirect dans la promises sinon, redirigé trop vite...
      });
    })
    // Applied to the most recent 'return', 'catch' will manage both for errors
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findByIdAndRemove(prodId); // version 1 : any user can delete any product
  Product.deleteOne({ _id: prodId, userId: req.user._id }) // version 2 : only owner can delete its product
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};
