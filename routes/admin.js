const express = require("express");

// Destructuring the 'check' sub-package from 'express-validator'
// To pull-out property names from the object I get back
// as the 'check' property which holds a function (green)
const { body } = require("express-validator");

// productsController bundles all exported functions
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
// We can add as many handlers we want to 'get' they will be parsed form left to right
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title", "Title is too short or not alphanumeric")
      .isString()
      .isLength({ min: 3, max: 50 })
      .trim(),
    // body("imageUrl", "Image URL is not valid").isURL(),
    body("price", "Price is not valid").isFloat(),
    body("description", "Description is too short or too long")
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// dynamic path segment
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title", "Title is too short or not alphanumeric")
      .isString()
      .isLength({ min: 3, max: 50 })
      .trim(),
    // body("imageUrl", "Image URL is not valid").isURL(),
    body("price", "Price is not valid").isFloat(),
    body("description", "Description is too short or too long")
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
