/* eslint-env node */

const express = require("express"),
  passport = require("passport"),
  router = express.Router();

/**
 * Serves a form for users to log in to the system
 * shows an error message when the provided credentials are invalid
 */

router.get("/", (req, res) => {
    let rUser;
    if (req.user) {
        rUser = req.user;
    }
    return res.render("login", { user: rUser, title: "login", err: req.flash("error") });
});

/**
 * Accepts form data and uses the passport middleware to authenticate the user and setup a session
 */

router.post("/", passport.authenticate("local-login", { failureRedirect: "/login", failureFlash: true }), (req, res) => {
    req.user.online = true;
    req.user.save();
    res.cookie("user-id", req.user._id);
    return res.redirect("/dashboard");
});

module.exports = router;