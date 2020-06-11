const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  // 'createProduct' : method created by sequelize from 'User.hasMany(Product)' !
  // thus both models are connected when created
  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
    })
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // return "true" if 'edit' property defined in the query params ?
  if (editMode != "true") {
    // la query value is a string: edit=true
    res.redirect("/");
  }
  const prodId = req.params.productId;
  // Solution #1 : all users can edit the product
  // Product.findByPk(prodId)
  // .then((product) => {
  //   if (!product) {
  //     return res.redirect("/");
  //   }
  // Solution #2 : for the user link to the product only
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      // getProducts return an array, even if there is only 1 element
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

// postEditProduct is a new 'action' which receive (req, res) objects and (next) function
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  Product.findByPk(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT");
      res.redirect("/admin/products"); // redirect dans la promises sinon, redirigé trop vite...
    }) // Applied to the most recent 'return', 'catch' will manage both for errors
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  // Previous solution, before user model
  // Product.findAll()
  // Solution #2 : Products from the user
  req.user.getProducts()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // Solution #1
  // Product.destroy({
  //   where: {
  //     id: prodId,
  //   },
  // })
  //   .then(() => res.redirect("/admin/products"))
  //   .catch((err) => console.log(err));
  // SOlution #2
  Product.findByPk(prodId)
    .then((product) => {
      // return to attach the 2nd then to control if delete succeeded
      return product.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      // redirect only if delete succeeded
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
