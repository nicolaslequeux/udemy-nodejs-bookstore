const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1] == 'true';
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  // To setup a cookie
  // res.setHeader("Set-Cookie", "loggedIn=true");
  User.findById("5ee9de40a10381fe470e4367")
    .then((user) => {
      // To setup a session object with key 'isLoggedIn'
      req.session.isLoggedIn = true;
      // I store the full mongoose user model, thus I can use mongoose methods on it
      req.session.user = user;
      // I use req.session.save to use the callbak to redirect when mongodb responded or sure
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
