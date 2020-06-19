exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1] == 'true';
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;
  // console.log(email, password);
  res.setHeader("Set-Cookie", "loggedIn=true");
  res.redirect("/");
};
