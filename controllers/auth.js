const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport"); // green = function

const User = require("../models/user");

// initializations
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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"
    },
  })
);

exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1] == 'true';
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // flash method provided by flash middleware, take key-value pairs for flash messages
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            // To setup a session object with key 'isLoggedIn'
            req.session.isLoggedIn = true;
            // I store the full mongoose user model, thus I can use mongoose methods on it
            req.session.user = user;
            // I use req.session.save to use the callbak to redirect when mongodb responded or sure
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          return res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        // ! PS : the 'return' ends the function execution, but the chained '.then' is then executed... this is how promises work
        // Also if I chain before redirecting, the stack of emails to be send will slow down the app!
        req.flash("error", "Email exists already");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
          // transporter.sendMail returns a Promises... but no need to wait for email sending to be completed to return in this case
          return transporter.sendMail({
            to: email,
            from: "contact@nicolaslequeux.com",
            subject: "Signup completed!",
            html: "<h1>You successfully signed up!</h1>",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
