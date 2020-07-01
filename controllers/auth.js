const crypto = require("crypto");

const bcrypt = require("bcryptjs");
// sedning email from node
const nodemailer = require("nodemailer");
// email service
const sendgridTransport = require("nodemailer-sendgrid-transport"); // green = function
// validationResult gathers all results from validation error on the route
const { validationResult } = require("express-validator");

const User = require("../models/user");

// initializations sendgrid
// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         "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",
//     },
//   })
// );

// initialization mailDev : FIRTS LAUNCH MAILDEV IN A NEW TERMINAL TO LISTEN TO
const transporter = nodemailer.createTransport({
  port: 1025,
  ignoreTLS: true,
  // other settings...
});

exports.getLogin = (req, res, next) => {
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
    oldInput: {
      email: null,
      password: null,
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // Gather all msg errors from validator package
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // I use return thus following code 'User.fondOne()' will not execute
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      // return msg defined into route validator instead of previous version
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
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
    .catch((err) => {
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
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
    oldInput: {
      email: null,
      password: null,
      confirmPassword: null,
    },
    // if I want to use all message from validators in my view, I have to pass them
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  // No more need to check if email already exists as done by the valida
  bcrypt
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
    .catch((err) => {
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Invalid email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1H in ms
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "contact@nicolaslequeux.com",
          subject: "Password reset",
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => {
        // console.log(err);
        // res.redirect("/500");
        const error = new Error("err");
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }, //$gt greater than
  })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/new-password",
        errorMessage: message,
        userId: user._id.toString(), // will be available in the view for the POST request
        passwordToken: token,
      });
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() }, //$gt greater than
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      const error = new Error("err");
      error.httpStatusCode = 500;
      return next(error);
    });
};
