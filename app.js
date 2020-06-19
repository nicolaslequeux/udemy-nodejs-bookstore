const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

// TEMPLATING ENGINE
app.set("view engine", "ejs");
app.set("views", "./views");

// IMPORT ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// MIDDLEWARES
// Are just registered to be executed by incoming requests, thus I can register any middleware before starting sequelize which starts 'app.listen(3000)' and so on...
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware used as an helper to pass user id manually for development mode
app.use((req, res, next) => {
  User.findById("5ee9de40a10381fe470e4367")
    .then((user) => {
      // I store the full mongoose user model in my request, thus I can use mongoose methods on it
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// PASSING ROUTES
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// mongoose connection - node need of a database utility file, all is managed by mongoose!
mongoose
  .connect(
    "mongodb+srv://nico-test:nico123test@nodejs-bookstore-qqnku.mongodb.net/shop?retryWrites=true",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    // I create my first user before starting listening, no need to recreate it if exists
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Nicolas",
          email: "test@test.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
