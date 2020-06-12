const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

// IMPORT 404 'CONTROLLER' (NO NEED FOR ROUTER HERE)
const errorController = require("./controllers/error");
const { mongoConnect } = require("./util/database");

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
  // User.findByPk(1)
  //   .then((user) => {
  //     // req is an object where I can add new field as long I not overright existing ones as 'body'
  //     // user is not a simple JS object it is a sequelize object with all sequelize methods!
  //     // it means I can use destroy method on user
  //     req.user = user;
  //     next();
  //   })
  //   .catch((err) => console.log(err));
  next();
});

// PASSING ROUTES
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000);
});
