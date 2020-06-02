const path = require("path");

const express = require("express");

// productsController bundles all exported functions
const productsController = require("../controllers/products");

const router = express.Router();

router.get("/add-product", productsController.getAddProduct);
router.post("/add-product", productsController.postAddProduct);

module.exports = router;