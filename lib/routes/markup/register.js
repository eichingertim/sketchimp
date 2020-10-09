/* eslint-env node */

const express = require("express"),
  passport = require("passport"),
  router = express.Router();

/**
 * GET-Route that serves a form for users to complete the Sign-Up Process 
 */

router.get("/", (req, res) => {
  let rUser;
  if (req.user) {
      rUser = req.user;
  }
  return res.render("register", { user: rUser, title: "register", err: req.flash("error") });
});

/**
 * POST Route that handles user Sign-Up by authenticating through passport middleware,
 * an error message is set through flash when Sign-Up fails
 * Setting the userId as a client side cookie is required for the Applications Websocket
 */

router.post("/", passport.authenticate("local-signup", { failureRedirect: "/register", failureFlash: true }), (req, res)=>{
    req.user.online = true;
    req.user.save();
    res.cookie("user-id", req.user._id);
    return res.redirect("/dashboard");
});

module.exports = router;