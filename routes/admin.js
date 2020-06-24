const express = require("express");
const router = express.Router();

// productsController bundles all exported functions
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

// /admin/add-product => GET
// We can add as many handlers we want to 'get' they will be parsed form left to right
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", isAuth, adminController.postAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// dynamic path segment
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, adminController.postEditProduct);

// /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);


module.exports = router;
