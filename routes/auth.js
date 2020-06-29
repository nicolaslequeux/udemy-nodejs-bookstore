const express = require("express");

// Destructuring the 'check' sub-package from 'express-validator'
// To pull-out property names from the object I get back
// as the 'check' property which holds a function (green)
const { body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email account")
      .normalizeEmail(), // sanitization
    body("password", "Incorrect password format or length")
      .isLength({ min: 3 })
      .isAlphanumeric()
      .trim(), // sanitization
  ],
  authController.postLogin
);

// To add validation, I add the body middleware and call '.isEmail()' method on the returned check object that will look for 'email' field on the incoming request body. I can search into body, query params, headers, cookies
router.post(
  "/signup",
  // Array of fields to validate
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      // I can make my own validator, which is simply a function that receives value of the checking field and optionaly an object where we can extract things from (as 'req' object). I wanna throw an error when validation fails
      .custom((value, { req }) => {
        if (value === "test@test.com") {
          throw new Error("This email address is forbidden.");
        }
        return true;
      })
      // async validation (because we reach out the database)
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("User already exists!");
        }
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter an alphanumeric password with at least 3 characters" // default message for all validators
    )
      .isLength({ min: 3 })
      .isAlphanumeric()
      .trim(),
    // I use a custom validator to check equality of 2 fields
    body("confirmPassword").trim().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
