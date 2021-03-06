const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

// PS : THE ORDERS OF ROUTES MATTERS!

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

// The colon in ':abc' adds a variable segment into Express.js
router.get("/products/:productId", shopController.getProduct);

// router.get("/products/delete"); will never be reach as behind a dynamic segment starting with /product too, so the delete segment should go before... orders matters!

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.get("/checkout", isAuth, shopController.getCheckout);
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
