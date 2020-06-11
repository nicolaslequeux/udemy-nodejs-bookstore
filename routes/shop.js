const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();


// PS : THE ORDERS OF ROUTES MATTERS!

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

// The colon in ':abc' adds a variable segment into Express.js
router.get("/products/:productId", shopController.getProduct);
// router.get("/products/delete"); will never be reach as behind a dynamic segment starting with /product too, so the delete segment should go before... orders matters!

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete-item", shopController.postCartDeleteProduct);

router.post("/create-order", shopController.postOrder);

router.get("/orders", shopController.getOrders);

//router.get("/checkout", shopController.getCheckout);

module.exports = router;
