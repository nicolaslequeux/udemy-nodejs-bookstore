const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
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
// secure Response headers
const helmet = require("helmet");
// compression middleware
const compression = require("compression");
// Logger
const morgan = require("morgan");

const errorController = require("./controllers/error");
const User = require("./models/user");

// This variable is usually managed by the hosting provider
console.log(process.env.NODE_ENV);

// `mongodb+srv://nico-test:nico123test@nodejs-bookstore-qqnku.mongodb.net/shop`;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nodejs-bookstore-qqnku.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

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

// Configuration object for multer (file body parser)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

// Helper for multer to filter file type
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // I accept the file
  } else {
    cb(null, false); // otherwise I refuse it
  }
};

// TEMPLATING ENGINE
app.set("view engine", "ejs");
app.set("views", "./views");

// IMPORT ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const { Stream } = require("stream");


// Create destination file for 'morgan' logger middleware
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// MIDDLEWARE TO SECURE RESPONSE HEADERS, COMPRESSION (Usualy managed by provider)...
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

// MIDDLEWARES
// Are just registered to be executed by incoming requests, thus I can register any middleware before starting sequelize which starts 'app.listen(3000)' and so on...
app.use(bodyParser.urlencoded({ extended: false }));

// I definie the name of the input value 'image' which will hold the file that Multer will be looking for, then the folder to store data
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// public path available at the !root of the project to store css... 'public' is a convention with nodeJS
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

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
  console.log("req.session.isLoggedIn: ", req.session.isLoggedIn);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    error: error,
  });
});

// mongoose connection - node need of a database utility file, all is managed by mongoose!
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
