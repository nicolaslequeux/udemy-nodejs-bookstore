const express = require("express");
const router = express.Router();

// productsController bundles all exported functions
const adminController = require("../controllers/admin");

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", adminController.postAddProduct);

// /admin/products => GET
router.get("/products", adminController.getProducts);

// dynamic path segment
router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", adminController.postEditProduct);

// /admin/delete-product => POST
router.post("/delete-product", adminController.postDeleteProduct);


module.exports = router;
