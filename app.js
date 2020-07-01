const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
// object modeling for mongodb
const mongoose = require("mongoose");
// create session object store on server side (instead of cookie)
const session = require("express-session");
// store the session on a mongoDB
const MongoDBStore = require("connect-mongodb-session")(session);
// manage csrf attack, stored on session object (need session)
const csrf = require("csurf");
// manage flash messages stored on session (need a session module)
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://nico-test:nico123test@nodejs-bookstore-qqnku.mongodb.net/shop";

const app = express();

// constructor to create a 'store' (or any other name) to store session infos on mongoDB
const store = new MongoDBStore(
  // passing options to the constructor
  {
    uri: MONGODB_URI,
    collection: "sessions",
  }
);

// By default the csrf token is saved into the session
const csrfProtection = csrf();

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

// public path available at the !root of the project to store css... 'public' is a convention with nodeJS
app.use(express.static(path.join(__dirname, "public")));

// Initialization session middleware from 'express-session' package
// this 'session' object will be available on all 'req' and stored on server side session not cookies
app.use(
  session({
    secret: "my seceret", //should be a long string value in production (used to hash the cookie on browser side)
    resave: "false",
    saveUninitialized: false,
    store: store,
  })
);
// I can add 'csrf' after I have initialized the 'session' that csfr will use to store tokens
app.use(csrfProtection);

// after session initialization as it needs session
app.use(flash());

app.use((req, res, next) => {
  // ExpressJS : I define local variables wich will be passed to the views
  // I can move the isAuthenticated property from controller to app.js
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // 'csrfToken' method is provided by the csrf midlleware we added
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Middleware helper to extract/pass user
app.use((req, res, next) => {
  // if no user defined into session, exit the function
  if (!req.session.user) {
    return next();
  }
  // if user defined (from auth controller postLogin), then fetch the DB
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      // I store the full mongoose user model in my request, thus I can use mongoose methods on it on any req
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      // I cannot reach the express error middleware from a Promises (async code) or a callback !!
      // throw new Error(err); // WILL not work as will not be catchec by the error middleware
      // Solution:
      next(new Error(err));
    });
});

// PASSING ROUTES !!!! AFTER THE MIDDELWARES !!!!
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);

// default route in case no previous routes is valid
app.use(errorController.get404);

// This middleware should never be reached, as the latest, exept if an error object is created!
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  //res.redirect("/500");
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

// mongoose connection - node need of a database utility file, all is managed by mongoose!
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
