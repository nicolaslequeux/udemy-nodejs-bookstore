const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://nico-test:nico123test@nodejs-bookstore-qqnku.mongodb.net/shop";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

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
// Initialization session middleware
app.use(
  session({
    secret: "my seceret",
    resave: "false",
    saveUninitialized: false,
    store: store,
  })
);

// Middleware helper to pass user
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
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
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
