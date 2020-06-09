const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const db = require("./util/database");

const app = express();

// TEMPLATING ENGINE
app.set("view engine", "ejs");
app.set("views", "./views");

// IMPORT 404 'CONTROLLER' (NO NEED FOR ROUTER HERE)
const errorController = require("./controllers/error");

// IMPORT ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// PASSING ROUTES
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
