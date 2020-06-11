const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

// IMPORT 404 'CONTROLLER' (NO NEED FOR ROUTER HERE)
const errorController = require("./controllers/error");
const sequelize = require("./util/database");

// I import the models in order to relate them (make associations)
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

// TEMPLATING ENGINE
app.set("view engine", "ejs");
app.set("views", "./views");

// IMPORT ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// MIDDLEWARES
// Are just registered to be executed by incoming requests, thus I can register any middleware before starting sequelize which starts 'app.listen(3000)' and so on...
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      // req is an object where I can add new field as long I not overright existing ones as 'body'
      // user is not a simple JS object it is a sequelize object with all sequelize methods!
      // it means I can use destroy method on user
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// PASSING ROUTES
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Create associations / relations
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product); // Relation not mandatory has defined by default with 'Product.belongsTo(User)

User.hasOne(Cart); // will add a user.id to the cart
Cart.belongsTo(User); // the first direction was enough... just to understand better

// many-to-many trough the combinaison of the middle table
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// one to many relationship
Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem }); // this is the inverse same relationship

// Synch models into the db by creating the appropriate table, and relations if they exist...
// 'createdAt' and 'updatedAt' will be automatically added by default...
sequelize
  // 'force: true' not suitable in production has drop tables if new relations added, ok for dev.
  //.sync({ force: true })
  .sync()
  .then((result) => {
    // Je recherche if 1 user exits for testing, otherwise create one
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Nicolas", email: "test@test.com" });
    }
    // if user id1 exist, then return directly the user object without re-creating it
    return user;
  })
  .then((user) => {
    // once user is created, I create/add a cart (all this is for dev mode)
    return user.createCart();
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
